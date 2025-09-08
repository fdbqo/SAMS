import { NextRequest, NextResponse } from "next/server";

const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB
const MAX_JSON_SIZE = 10 * 1024; // 10KB for JSON payloads

export function withRequestLimits(
  handler: (req: NextRequest, ctx?: any) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, ctx?: any) => {
    // Check content length
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        { error: "Request too large" },
        { status: 413 }
      );
    }

    // For JSON requests, check if body is too large
    if (req.headers.get("content-type")?.includes("application/json")) {
      try {
        const body = await req.clone().text();
        if (body.length > MAX_JSON_SIZE) {
          return NextResponse.json(
            { error: "JSON payload too large" },
            { status: 413 }
          );
        }
      } catch (error) {
        // If we can't read the body, let the handler deal with it
        console.warn("Could not read request body for size check:", error);
      }
    }

    return handler(req, ctx);
  };
}
