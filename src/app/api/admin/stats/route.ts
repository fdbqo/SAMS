import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/upstash";

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const sessionId = request.cookies.get("admin_session")?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const adminSession = await redis.get(`admin:session:${sessionId}`);
    if (!adminSession) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Clean up any old admin sessions (except current one)
    const oldSessionKeys = await redis.keys("admin:session:*");
    const keysToDelete = oldSessionKeys.filter(key => key !== `admin:session:${sessionId}`);
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
    }

    // Get stats from Redis
    const [totalOrigins, totalSessions, recentLogins] = await Promise.all([
      redis.scard("allowed_origins"), // Count of allowed origins
      redis.scard("active_sessions"), // Count of active sessions
      redis.get("recent_logins_24h") || 0, // Recent logins count
    ]);

    return NextResponse.json({
      totalOrigins,
      totalSessions,
      recentLogins: parseInt(recentLogins as string) || 0,
    });
  } catch (err: any) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
