import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccess } from "@/lib/jwt";
import { getEnv } from "@/lib/env";

const ENV = getEnv();

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  if (!ENV.ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 400 });
  }
  const res = NextResponse.json({});
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  if (!ENV.ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 400 });
  }

  try {
    const accessToken = request.cookies.get("steam_access")?.value;
    if (!accessToken) {
      const res = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      return res;
    }

    const payload = verifyAccess(accessToken);
    const steamId = payload.steamId;

    const steamRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${ENV.STEAM_API_KEY}&steamids=${steamId}`
    );
    if (!steamRes.ok) throw new Error("Failed to fetch Steam profile");
    const data = await steamRes.json();
    const player = data.response.players[0];
    if (!player) throw new Error("Steam profile not found");

    const result = {
      steamId,
      displayName: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
    };

    const res = NextResponse.json(result);
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  } catch (err: any) {
    console.error("Me endpoint error:", err);
    const res = NextResponse.json({ error: err.message }, { status: 401 });
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  }
}
