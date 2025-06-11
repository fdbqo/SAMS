import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRefresh, issueTokens, revokeSession } from "@/lib/jwt";
import { getEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rateLimiter";
import { withCORS } from "@/lib/withCors";

const ENV = getEnv();

const handler = async (request: NextRequest) => {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  const tooMany = await rateLimit(`rl:refresh:${ip}`, 10, 60);
  if (tooMany) {
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      { status: 429 }
    );
  }

  try {
    const refreshToken = request.cookies.get("steam_refresh")?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
    }

    const payload = await verifyRefresh(refreshToken);
    await revokeSession(payload.sessionId);

    const { accessToken, accessExp, refreshToken: newRefresh, refreshExp } =
      await issueTokens(payload.steamId, request.headers.get("x-client-app") || undefined);

    const now = Math.floor(Date.now() / 1000);
    const accessMaxAgeSec = accessExp - now;
    const refreshMaxAgeSec = refreshExp - now;

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "steam_access",
      value: accessToken,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: accessMaxAgeSec,
    });
    response.cookies.set({
      name: "steam_refresh",
      value: newRefresh,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: refreshMaxAgeSec,
    });

    return response;
  } catch (err: any) {
    console.error("Refresh error:", err);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
};

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));