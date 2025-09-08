import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccess } from "@/lib/jwt";
import { ENV } from "@/lib/env";
import { withCORS } from "@/lib/withCors";

const handler = async (request: NextRequest) => {
  try {
    console.log("[me] Request received");
    console.log("[me] Headers:", Object.fromEntries(request.headers.entries()));
    console.log("[me] Cookies:", Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])));
    
    // Try to get token from cookies first, then from Authorization header
    let accessToken = request.cookies.get("sams_access_token")?.value;
    console.log("[me] Cookie token:", accessToken ? "Found" : "Not found");
    
    if (!accessToken) {
      const authHeader = request.headers.get("authorization");
      console.log("[me] Auth header:", authHeader ? "Found" : "Not found");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        accessToken = authHeader.substring(7);
        console.log("[me] Bearer token extracted:", accessToken ? "Yes" : "No");
      }
    }
    
    if (!accessToken) {
      console.log("[me] No access token found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    console.log("[me] Access token found, verifying...");

    const payload = verifyAccess(accessToken);
    const steamId = payload.steamId;
    console.log("[me] Token verified, Steam ID:", steamId);

    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${ENV.STEAM_API_KEY}&steamids=${steamId}`
    );
    if (!res.ok) {
      console.log("[me] Steam API request failed:", res.status, res.statusText);
      throw new Error("Failed to fetch Steam profile");
    }
    const data = await res.json();
    const player = data.response.players[0];
    if (!player) {
      console.log("[me] No player found in Steam response");
      throw new Error("Steam profile not found");
    }

    console.log("[me] User profile fetched successfully:", player.personaname);
    return NextResponse.json({
      steamId,
      displayName: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
    });
  } catch (err: any) {
    console.error("Me endpoint error:", err);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
};

export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));