import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { redis } from "@/lib/upstash";
import { getEnv } from "@/lib/env";

const ENV = getEnv();

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


export async function issueTokens(steamId: string, clientApp?: string) {
    const now = Math.floor(Date.now() / 1000);

    const sessionId = randomUUID();

    const accessExp = now + 15 * 60; // 15 minutes
    const accessToken = jwt.sign(
        { steamId, sessionId },
        ENV.JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: accessExp - now,
        }
    );

    const refreshExp = now + 7 * 24 * 60 * 60; // 7 days
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

    if (clientApp) {
        const meta = JSON.stringify({
            steamId,
            clientApp,
            issuedAt: now,
            expiresAt: refreshExp,
        });
        await redis.set(`sessiondata:${sessionId}`, meta, {
            ex: 7 * 24 * 60 * 60,
        });
    }

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
