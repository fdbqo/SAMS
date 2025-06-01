// src/app/api/auth/steam/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { getEnv } from "@/lib/env";
import { redis } from "@/lib/upstash";
import { SteamClient } from "@/lib/steamClient";

const ENV = getEnv();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin") || "";

  if (!ENV.ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 400 });
  }

  const state = randomBytes(16).toString("hex");
  await redis.set(`steam:state:${state}`, origin, { ex: 5 * 60 });

  const steamUrl = SteamClient.steamAuthUrl(state);
  return NextResponse.redirect(steamUrl);
}
