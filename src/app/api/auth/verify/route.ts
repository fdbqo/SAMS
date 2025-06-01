import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccess } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { token } = (await request.json()) as { token?: string };
    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Missing token" },
        { status: 400 }
      );
    }
    const payload = verifyAccess(token);
    return NextResponse.json({ valid: true, user: { steamId: payload.steamId } });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
