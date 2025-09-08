import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSession } from "@/lib/jwt";
import { ENV } from "@/lib/env";
import { withCORS } from "@/lib/withCors";
import { rateLimit } from "@/lib/rateLimiter";

const handler = async (request: NextRequest) => {
  try {
    console.log("[user] Request received");
    
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip")?.trim() ||
               "unknown";
    const tooMany = await rateLimit(`rl:user:${ip}`, 30, 60); // 30 requests per minute
    if (tooMany) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      console.log("[user] No session ID provided");
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    console.log("[user] Validating session:", sessionId);
    const validation = await validateSession(sessionId);
    
    if (!validation.valid) {
      console.log("[user] Invalid session");
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    const steamId = validation.steamId!;
    console.log("[user] Fetching Steam profile for:", steamId);

    // Fetch Steam profile
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${ENV.STEAM_API_KEY}&steamids=${steamId}`
    );
    
    if (!res.ok) {
      console.log("[user] Steam API request failed:", res.status, res.statusText);
      throw new Error("Failed to fetch Steam profile");
    }
    
    const data = await res.json();
    const player = data.response.players[0];
    
    if (!player) {
      console.log("[user] No player found in Steam response");
      throw new Error("Steam profile not found");
    }

    const userData = {
      steamId,
      displayName: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
      sessionId,
      sessionData: validation.sessionData
    };

    console.log("[user] User profile fetched successfully:", player.personaname);
    return NextResponse.json(userData);
  } catch (err: any) {
    console.error("[user] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));
