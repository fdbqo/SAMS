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

    if (!state) {
      return new NextResponse("Missing state", { status: 400, headers: { "Content-Type": "text/plain" } });
    }

    const originRaw = await redis.get(`steam:state:${state}`);
    const origin = typeof originRaw === "string" ? originRaw : "";
    if (!origin || !ENV.ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse("Invalid or expired state", { status: 400, headers: { "Content-Type": "text/plain" } });
    }
    await redis.del(`steam:state:${state}`);

    const queryObj: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) queryObj[k] = v;
    const { steamId } = await SteamClient.verifyCallback(queryObj);

    const { accessToken, accessExp, refreshToken, refreshExp } = await issueTokens(
      steamId
    );

    const now = Math.floor(Date.now() / 1000);
    const accessMaxAgeSec = accessExp - now;
    const refreshMaxAgeSec = refreshExp - now;

    const response = NextResponse.redirect(origin);
    response.cookies.set({
      name: "steam_access",
      value: accessToken,
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: accessMaxAgeSec,
    });
    response.cookies.set({
      name: "steam_refresh",
      value: refreshToken,
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: refreshMaxAgeSec,
    });

    return response;
  } catch (err: any) {
    console.error("Callback error:", err);
    return new NextResponse("Authentication failed", { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
