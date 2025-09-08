import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRefresh, revokeSession } from "@/lib/jwt";
import { redis } from "@/lib/upstash";
import { withCORS } from "@/lib/withCors";
import { ENV } from "@/lib/env";

const handler = async (request: NextRequest) => {
  try {
    console.log("[logout] Request received");
    
    // Handle both session-based and token-based logout
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId;
    
    if (sessionId) {
      console.log("[logout] Revoking session:", sessionId);
      await redis.del(`session:${sessionId}`);
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