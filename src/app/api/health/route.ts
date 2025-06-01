import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  return NextResponse.json({ ok: true, time: Date.now() });
}
