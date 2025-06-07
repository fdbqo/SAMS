import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccess } from "@/lib/jwt";
import { getEnv } from "@/lib/env";
import { withCORS } from "@/lib/withCors";

const ENV = getEnv();

const handler = async (request: NextRequest) => {


  try {
    const accessToken = request.cookies.get("steam_access")?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyAccess(accessToken);
    const steamId = payload.steamId;


    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${ENV.STEAM_API_KEY}&steamids=${steamId}`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch Steam profile");
    }
    const data = await res.json();
    const player = data.response.players[0];
    if (!player) {
      throw new Error("Steam profile not found");
    }

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