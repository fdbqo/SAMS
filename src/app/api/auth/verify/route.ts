import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccess } from "@/lib/jwt";
import { withCORS } from "@/lib/withCors";

const handler = async (request: NextRequest) => {
  try {
    const { token } = (await request.json()) as { token?: string };
    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
    }
    const payload = verifyAccess(token);
    return NextResponse.json({ valid: true, user: { steamId: payload.steamId } });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
};

export const POST = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));
