import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRefresh, revokeSession, revokeAllUserSessions } from "@/lib/jwt";
import { redis } from "@/lib/upstash";
import { withCORS } from "@/lib/withCors";
import { ENV } from "@/lib/env";
import { rateLimit } from "@/lib/rateLimiter";

const handler = async (request: NextRequest) => {
  try {
    console.log("[logout] Request received");
    
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip")?.trim() ||
               "unknown";
    const tooMany = await rateLimit(`rl:logout:${ip}`, 10, 60); // 10 requests per minute
    if (tooMany) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    
    // Handle both session-based and token-based logout
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId;
    const revokeAll = body.revokeAll; // Optional: revoke all sessions for this user
    
    if (sessionId) {
      console.log("[logout] Revoking session:", sessionId);
      
      if (revokeAll) {
        // Get steamId from session to revoke all user sessions
        const sessionDataRaw = await redis.get(`session:${sessionId}`);
        if (sessionDataRaw) {
          let sessionData;
          if (typeof sessionDataRaw === 'string') {
            sessionData = JSON.parse(sessionDataRaw);
          } else {
            sessionData = sessionDataRaw;
          }
          
          if (sessionData.steamId) {
            console.log("[logout] Revoking all sessions for user:", sessionData.steamId);
            await revokeAllUserSessions(sessionData.steamId);
          }
        } else {
          // Session not found, but still try to revoke the specific session
          console.log("[logout] Session not found, attempting to revoke anyway");
          await revokeSession(sessionId);
        }
      } else {
        await revokeSession(sessionId);
      }
    }
    
    // Legacy token-based logout
    const refreshToken = request.cookies.get("steam_refresh")?.value;
    if (refreshToken) {
      try {
        const payload = await verifyRefresh(refreshToken);
        await revokeSession(payload.sessionId);
      } catch {
        // Ignore errors for legacy tokens
      }
    }

    const response = NextResponse.json({ success: true });
    
    // Clear legacy cookies
    response.cookies.set({
      name: "steam_access",
      value: "",
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
    });
    response.cookies.set({
      name: "steam_refresh",
      value: "",
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log("[logout] Logout successful");
    return response;
  } catch (err: any) {
    console.error("[logout] Error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
};

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));