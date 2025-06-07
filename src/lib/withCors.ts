import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/env";

const ENV = getEnv();

function getCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };
}

export function withCORS(
  handler: (req: NextRequest, ctx?: any) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, ctx?: any) => {
    const origin = req.headers.get("origin") || "";
    const allowed = ENV.ALLOWED_ORIGINS?.includes(origin);
    if (req.method === "OPTIONS") {
      if (!allowed) return new NextResponse(null, { status: 403 });
      return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
    }
    const res = await handler(req, ctx);
    if (allowed) {
      Object.entries(getCorsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v));
    }
    return res;
  };
}