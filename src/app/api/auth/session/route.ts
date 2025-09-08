import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSession } from "@/lib/jwt";
import { withCORS } from "@/lib/withCors";

const handler = async (request: NextRequest) => {
  try {
    console.log("[session] Request received");
    
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      console.log("[session] No session ID provided");
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    console.log("[session] Validating session:", sessionId);
    const validation = await validateSession(sessionId);
    
    if (!validation.valid) {
      console.log("[session] Invalid session");
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    console.log("[session] Valid session for Steam ID:", validation.steamId);
    return NextResponse.json({
      valid: true,
      steamId: validation.steamId,
      sessionData: validation.sessionData
    });
  } catch (err: any) {
    console.error("[session] Error:", err);
    return NextResponse.json({ error: "Session validation failed" }, { status: 500 });
  }
};

export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));
