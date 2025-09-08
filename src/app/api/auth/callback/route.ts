import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/upstash";
import { SteamClient } from "@/lib/steamClient";
import { createSession } from "@/lib/jwt";
import { withCORS } from "@/lib/withCors";

const handler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") || "";

    const raw = await redis.get(`steam:state:${state}`);
    if (!raw) {
      return new NextResponse("Invalid or expired state", { status: 400 });
    }

    let origin: string;
    let redirectTo: string;

    if (typeof raw === "string") {
      const obj = JSON.parse(raw);
      origin = obj.origin;
      redirectTo = obj.redirectTo;
    } else {
      origin = (raw as any).origin;
      redirectTo = (raw as any).redirectTo;
    }

    // Double-check origin is still allowed (from Redis)
    const allowedOrigins = await redis.smembers("allowed_origins");
    if (!allowedOrigins.includes(origin)) {
      return new NextResponse("Origin not allowed", { status: 400 });
    }

    await redis.del(`steam:state:${state}`);

    const queryObj: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) {
      queryObj[k] = v;
    }

    const { steamId } = await SteamClient.verifyCallback(queryObj);

    // Create session instead of tokens
    const { sessionId, expiresAt } = await createSession(steamId);
    console.log("[callback] Session created for Steam ID:", steamId);
    console.log("[callback] Session ID:", sessionId);
    console.log("[callback] Expires at:", new Date(expiresAt * 1000).toISOString());

    // Redirect with session ID in hash (client-side only)
    const redirectUrl = `${origin}${redirectTo}#sessionId=${encodeURIComponent(sessionId)}`;
    console.log("[callback] Redirecting with session ID in hash");
    const response = NextResponse.redirect(redirectUrl);
    return response;
  } catch (err: any) {
    console.error("Callback error:", err);
    return new NextResponse("Authentication failed", { status: 500 });
  }
};

export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));