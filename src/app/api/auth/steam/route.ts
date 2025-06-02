import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { getEnv } from "@/lib/env";
import { redis } from "@/lib/upstash";
import { SteamClient } from "@/lib/steamClient";
import { rateLimit } from "@/lib/rateLimiter";

const ENV = getEnv();

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const tooMany = await rateLimit(`rl:steam:${ip}`, 5, 60);
  if (tooMany) {
    return NextResponse.json(
      { error: "Too many login attempts, please try again later." },
      { status: 429 }
    );
  }

  const rawOrigin = request.nextUrl.searchParams.get("origin") || "";
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/";

  let origin: string;
  try {
    origin = new URL(rawOrigin).origin;
  } catch {
    return NextResponse.json(
      { error: "Invalid origin format" },
      { status: 400 }
    );
  }

  if (!ENV.ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 400 });
  }

  const state = randomBytes(16).toString("hex");
  await redis.set(
    `steam:state:${state}`,
    JSON.stringify({ origin, redirectTo }),
    { ex: 5 * 60 }
  );

  const steamUrl = SteamClient.steamAuthUrl(state);
  return NextResponse.redirect(steamUrl);
}
