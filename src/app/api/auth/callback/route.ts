import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { redis } from "@/lib/upstash";
import { SteamClient } from "@/lib/steamClient";
import { issueTokens } from "@/lib/jwt";

const ENV = getEnv();

export async function GET(request: NextRequest) {
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

    if (!ENV.ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse("Origin not allowed", { status: 400 });
    }

    await redis.del(`steam:state:${state}`);

    const queryObj: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) {
      queryObj[k] = v;
    }

    const { steamId } = await SteamClient.verifyCallback(queryObj);

    const { accessToken, refreshToken } = await issueTokens(steamId);

    const redirectUrl =
      `${origin}${redirectTo}` +
      `?access=${encodeURIComponent(accessToken)}` +
      `&refresh=${encodeURIComponent(refreshToken)}`;

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error("Callback error:", err);
    return new NextResponse("Authentication failed", { status: 500 });
  }
}