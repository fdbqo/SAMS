import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";
import { withCORS } from "@/lib/withCors";

const handler = async (request: NextRequest) => {
  try {
    const steamId = request.nextUrl.searchParams.get("steamId");
    if (!steamId) {
      return NextResponse.json({ error: "Missing steamId" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${ENV.STEAM_API_KEY}&steamids=${steamId}`
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch Steam profile" }, { status: 500 });
    }
    const data = await res.json();
    const player = data.response.players[0];
    if (!player) {
      return NextResponse.json({ error: "Steam profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      steamId,
      displayName: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
    });
  } catch (err: any) {
    console.error("Profile endpoint error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));