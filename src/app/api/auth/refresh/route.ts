import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRefresh, issueTokens, revokeRefresh } from "@/lib/jwt";
import { getEnv } from "@/lib/env";

const ENV = getEnv();

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("steam_refresh")?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
    }

    const payload = await verifyRefresh(refreshToken);
    await revokeRefresh(payload.jti);

    const { accessToken, accessExp, refreshToken: newRefresh, refreshExp } =
      await issueTokens(payload.steamId);

    const now = Math.floor(Date.now() / 1000);
    const accessMaxAgeSec = accessExp - now;
    const refreshMaxAgeSec = refreshExp - now;

    const response = NextResponse.json({ success: true });
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
      value: newRefresh,
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: refreshMaxAgeSec,
    });

    return response;
  } catch (err: any) {
    console.error("Refresh error:", err);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
