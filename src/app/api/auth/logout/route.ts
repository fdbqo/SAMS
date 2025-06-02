import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyRefresh, revokeSession } from "@/lib/jwt";

export async function POST(request: NextRequest) {
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
    sameSite: "lax",
  });
  response.cookies.set({
    name: "steam_refresh",
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
