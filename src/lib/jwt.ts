// src/lib/jwt.ts
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { redis } from "@/lib/upstash";
import { getEnv } from "@/lib/env";

const ENV = getEnv();

export interface AccessPayload {
  steamId: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface RefreshPayload {
  steamId: string;
  jti: string;
  iat: number;
  exp: number;
}

/**
 * Issue a 15-minute access token and a 7-day refresh token.
 * Refresh’s JTI is stored in Redis for revocation.
 */
export async function issueTokens(steamId: string) {
  const now = Math.floor(Date.now() / 1000);

  // Access token: TTL = 15 minutes
  const accessJti = randomUUID();
  const accessExp = now + 15 * 60;
  const accessToken = jwt.sign({ steamId, jti: accessJti }, ENV.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: accessExp - now,
  });

  // Refresh token: TTL = 7 days
  const refreshJti = randomUUID();
  const refreshExp = now + 7 * 24 * 60 * 60;
  const refreshToken = jwt.sign({ steamId, jti: refreshJti }, ENV.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: refreshExp - now,
  });

  // Store refresh JTI in Redis (key = "refresh:<jti>", value = steamId, TTL = 7 days)
  await redis.set(`refresh:${refreshJti}`, steamId, {
    ex: 7 * 24 * 60 * 60,
  });

  return { accessToken, accessExp, refreshToken, refreshExp };
}

/** Verify access token locally; throws if invalid/expired. */
export function verifyAccess(token: string): AccessPayload {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as AccessPayload;
  } catch {
    throw new Error("Invalid or expired access token");
  }
}

export async function verifyRefresh(token: string): Promise<RefreshPayload> {
  let payload: RefreshPayload;
  try {
    payload = jwt.verify(token, ENV.JWT_SECRET) as RefreshPayload;
  } catch {
    throw new Error("Invalid or expired refresh token");
  }
  const stored = await redis.get(`refresh:${payload.jti}`);
  if (!stored || stored !== payload.steamId) {
    throw new Error("Refresh token revoked or not found");
  }
  return payload;
}

export async function revokeRefresh(jti: string) {
  await redis.del(`refresh:${jti}`);
}
