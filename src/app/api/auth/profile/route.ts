import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

const ENV = getEnv();

export async function GET(request: NextRequest) {
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
}