import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { redis } from "@/lib/upstash";
import { SteamClient } from "@/lib/steamClient";
import { rateLimit } from "@/lib/rateLimiter";
import { withCORS } from "@/lib/withCors";

const handler = async (request: NextRequest) => {
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

  // Check if origin is allowed (from Redis)
  const allowedOrigins = await redis.smembers("allowed_origins");
  if (!allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 400 });
  }

  // Update last used timestamp for this origin
  await redis.set(`origin:${origin}:last_used`, new Date().toISOString());

  const state = randomBytes(16).toString("hex");
  await redis.set(
    `steam:state:${state}`,
    JSON.stringify({ origin, redirectTo }),
    { ex: 5 * 60 }
  );

  const steamUrl = SteamClient.steamAuthUrl(state);
  return NextResponse.redirect(steamUrl);
};

export const GET = withCORS(handler);
export const OPTIONS = withCORS(() => new NextResponse(null, { status: 204 }));
