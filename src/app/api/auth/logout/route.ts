import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRefresh, revokeSession } from "@/lib/jwt";
import { withCORS } from "@/lib/withCors";

const handler = async (request: NextRequest) => {
  const refreshToken = request.cookies.get("steam_refresh")?.value;
  if (refreshToken) {
    try {
      const payload = await verifyRefresh(refreshToken);
      await revokeSession(payload.sessionId);
    } catch {
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "steam_access",
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  response.cookies.set({
    name: "steam_refresh",
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return response;
};

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));