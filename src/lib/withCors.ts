import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/upstash";

function getCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Client-App",
  };
}

async function isOriginAllowed(origin: string): Promise<boolean> {
  if (!origin) return false;
  
  try {
    // Check if origin is in Redis allowed origins
    const isAllowed = await redis.sismember("allowed_origins", origin);
    return isAllowed === 1;
  } catch (error) {
    console.error("Error checking allowed origins:", error);
    return false;
  }
}

export function withCORS(
  handler: (req: NextRequest, ctx?: any) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, ctx?: any) => {
    const origin = req.headers.get("origin") || "";
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      const allowed = await isOriginAllowed(origin);
      if (!allowed) {
        return new NextResponse(null, { status: 403 });
      }
      return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
    }
    
    // Handle actual requests
    const res = await handler(req, ctx);
    const allowed = await isOriginAllowed(origin);
    
    if (allowed) {
      Object.entries(getCorsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v));
    }
    
    return res;
  };
}

