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

export async function createSession(steamId: string, clientApp?: string) {
  const now = Math.floor(Date.now() / 1000);
  const sessionId = randomUUID();
  const expiresAt = now + 7 * 24 * 60 * 60; // 7 days

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

export async function revokeSession(sessionId: string) {
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
    const sessionDataRaw = await redis.get(`session:${sessionId}`);
    if (!sessionDataRaw) {
      return { valid: false };
    }

    const sessionData = JSON.parse(sessionDataRaw as string);
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

    return { valid: true, steamId: sessionData.steamId, sessionData };
  } catch (error) {
    console.error("Session validation error:", error);
    return { valid: false };
  }
}

export async function revokeAllUserSessions(steamId: string): Promise<void> {
  try {
    const sessionIds = await redis.smembers(`user_sessions:${steamId}`);
    if (sessionIds.length > 0) {
      const pipeline = redis.pipeline();
      sessionIds.forEach(sessionId => {
        pipeline.del(`session:${sessionId}`);
      });
      pipeline.del(`user_sessions:${steamId}`);
      await pipeline.exec();
    }
  } catch (error) {
    console.error("Error revoking user sessions:", error);
  }
}
