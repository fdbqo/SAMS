import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENV } from "@/lib/env";
import { withCORS } from "@/lib/withCors";

const handler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("access");
    const refreshToken = searchParams.get("refresh");
    const redirectTo = searchParams.get("redirectTo") || "/";

    if (!accessToken || !refreshToken) {
      return new NextResponse("Missing tokens", { status: 400 });
    }

    const response = NextResponse.redirect(new URL(redirectTo, request.url));

    response.cookies.set("steam_access", accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, 
      path: "/",
    });

    response.cookies.set("steam_refresh", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, 
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Set-cookies error:", err);
    return new NextResponse("Failed to set cookies", { status: 500 });
  }
};

export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 })); 