import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/upstash";
import { SteamClient } from "@/lib/steamClient";
import { issueTokens } from "@/lib/jwt";
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

    const { accessToken, refreshToken } = await issueTokens(steamId);

    // Set cookies directly and redirect to the app
    const response = NextResponse.redirect(`${origin}${redirectTo}`);

    // Set cookies without domain restriction (will be set for SAMS domain)
    response.cookies.set('sams_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('sams_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error("Callback error:", err);
    return new NextResponse("Authentication failed", { status: 500 });
  }
};

export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));