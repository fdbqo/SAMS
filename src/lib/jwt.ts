import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { redis } from "@/lib/upstash";
import { ENV } from "@/lib/env";

export interface AccessPayload {
  steamId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface RefreshPayload {
  steamId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

/**
 * Creates a new session for a user
 * @param steamId - The Steam ID of the user
 * @param clientApp - Optional client application identifier
 * @param replaceExisting - If true, revokes all existing sessions for this user (single session mode)
 * @returns Object containing sessionId and expiresAt timestamp
 */
export async function createSession(steamId: string, clientApp?: string, replaceExisting: boolean = false) {
  const now = Math.floor(Date.now() / 1000);
  const sessionId = randomUUID();
  const expiresAt = now + 7 * 24 * 60 * 60; // 7 days

  // Clean up any existing sessions for this user if requested
  if (replaceExisting) {
    console.log(`[createSession] Replacing existing sessions for user: ${steamId}`);
    await revokeAllUserSessions(steamId);
  }

  // Store session data in Redis
  const sessionData = {
    steamId,
    clientApp: clientApp || null,
    createdAt: now,
    expiresAt,
    lastAccessed: now
  };

  await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), {
    ex: 7 * 24 * 60 * 60,
  });

  // Also store reverse lookup for cleanup
  await redis.sadd(`user_sessions:${steamId}`, sessionId);
  await redis.expire(`user_sessions:${steamId}`, 7 * 24 * 60 * 60);

  return { sessionId, expiresAt };
}

// Legacy function for backward compatibility
export async function issueTokens(steamId: string, clientApp?: string) {
  const { sessionId, expiresAt } = await createSession(steamId, clientApp);
  
  const now = Math.floor(Date.now() / 1000);
  const accessExp = now + 15 * 60;
  
  const accessToken = jwt.sign(
    { steamId, sessionId },
    ENV.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: accessExp - now,
    }
  );

  const refreshExp = expiresAt;
  const refreshToken = jwt.sign(
    { steamId, sessionId },
    ENV.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: refreshExp - now,
    }
  );

  await redis.set(`refresh:${sessionId}`, steamId, {
    ex: 7 * 24 * 60 * 60,
  });

  return { accessToken, accessExp, refreshToken, refreshExp };
}

export async function verifyRefresh(token: string): Promise<RefreshPayload> {
  let payload: RefreshPayload;
  try {
    payload = jwt.verify(token, ENV.JWT_SECRET) as RefreshPayload;
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const storedSteamId = await redis.get(`refresh:${payload.sessionId}`);
  if (!storedSteamId || storedSteamId !== payload.steamId) {
    throw new Error("Refresh token revoked or not found");
  }

  return payload;
}

/**
 * Revokes a specific session and cleans up associated data
 * @param sessionId - The session ID to revoke
 */
export async function revokeSession(sessionId: string) {
  // Get session data to find the steamId for cleanup
  const sessionDataRaw = await redis.get(`session:${sessionId}`);
  if (sessionDataRaw) {
    let sessionData;
    if (typeof sessionDataRaw === 'string') {
      sessionData = JSON.parse(sessionDataRaw);
    } else {
      sessionData = sessionDataRaw;
    }
    
    const steamId = sessionData.steamId;
    if (steamId) {
      // Remove session ID from user's session set
      await redis.srem(`user_sessions:${steamId}`, sessionId);
    }
  }
  
  // Delete the session data
  await redis.del(`session:${sessionId}`);
  
  // Legacy cleanup for token-based sessions
  await redis.del(`refresh:${sessionId}`);
  await redis.del(`sessiondata:${sessionId}`);
}

export function verifyAccess(token: string): AccessPayload {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as AccessPayload;
  } catch {
    throw new Error("Invalid or expired access token");
  }
}

export async function validateSession(sessionId: string): Promise<{ valid: boolean; steamId?: string; sessionData?: any }> {
  try {
    // Validate session ID format (UUID v4)
    if (!sessionId || typeof sessionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
      console.warn("Invalid session ID format:", sessionId);
      return { valid: false };
    }
    
    const sessionDataRaw = await redis.get(`session:${sessionId}`);
    if (!sessionDataRaw) {
      return { valid: false };
    }

    // Handle both string and object responses from Redis
    let sessionData;
    if (typeof sessionDataRaw === 'string') {
      sessionData = JSON.parse(sessionDataRaw);
    } else {
      sessionData = sessionDataRaw;
    }

    const now = Math.floor(Date.now() / 1000);

    if (sessionData.expiresAt < now) {
      // Session expired, clean it up
      await redis.del(`session:${sessionId}`);
      return { valid: false };
    }

    // Update last accessed time
    sessionData.lastAccessed = now;
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), {
      ex: 7 * 24 * 60 * 60,
    });
    
    // Ensure the session is still in the user sessions set
    await redis.sadd(`user_sessions:${sessionData.steamId}`, sessionId);

    return { valid: true, steamId: sessionData.steamId, sessionData };
  } catch (error) {
    console.error("Session validation error:", error);
    return { valid: false };
  }
}

/**
 * Revokes all sessions for a specific user (useful for "logout from all devices")
 * @param steamId - The Steam ID of the user
 */
export async function revokeAllUserSessions(steamId: string): Promise<void> {
  try {
    const sessionIds = await redis.smembers(`user_sessions:${steamId}`);
    if (sessionIds.length > 0) {
      const pipeline = redis.pipeline();
      sessionIds.forEach(sessionId => {
        pipeline.del(`session:${sessionId}`);
        // Also clean up legacy token data
        pipeline.del(`refresh:${sessionId}`);
        pipeline.del(`sessiondata:${sessionId}`);
      });
      pipeline.del(`user_sessions:${steamId}`);
      await pipeline.exec();
    }
  } catch (error) {
    console.error("Error revoking user sessions:", error);
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    // This function can be called periodically to clean up expired sessions
    // For now, we rely on Redis TTL, but this could be enhanced to actively clean up
    console.log("Session cleanup: Relying on Redis TTL for expired session cleanup");
  } catch (error) {
    console.error("Error during session cleanup:", error);
  }
}
