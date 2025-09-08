import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/upstash";
import { AuditLogger } from "@/lib/auditLogger";

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

    // Get all allowed origins
    const origins = await redis.smembers("allowed_origins");
    
    // Get metadata for each origin
    const sites = await Promise.all(
      origins.map(async (origin) => {
        const [addedAt, lastUsed] = await Promise.all([
          redis.get(`origin:${origin}:added_at`),
          redis.get(`origin:${origin}:last_used`),
        ]);
        
        return {
          origin,
          addedAt: addedAt || new Date().toISOString(),
          lastUsed: lastUsed || undefined,
        };
      })
    );

    return NextResponse.json({ sites });
  } catch (err: any) {
    console.error("Sites GET error:", err);
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { origin } = await request.json();
    
    if (!origin) {
      return NextResponse.json({ error: "Origin required" }, { status: 400 });
    }

    // Validate origin format
    try {
      new URL(origin);
    } catch {
      return NextResponse.json({ error: "Invalid origin format" }, { status: 400 });
    }

    // Add to allowed origins set
    await redis.sadd("allowed_origins", origin);
    
    // Store metadata
    await redis.set(`origin:${origin}:added_at`, new Date().toISOString());

    // Log the action
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip")?.trim() ||
               "unknown";
    const userAgent = request.headers.get("user-agent");
    await AuditLogger.logAdminAction("site_added", ip, userAgent, { origin });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Sites POST error:", err);
    return NextResponse.json({ error: "Failed to add site" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { origin } = await request.json();
    
    if (!origin) {
      return NextResponse.json({ error: "Origin required" }, { status: 400 });
    }

    // Remove from allowed origins set
    await redis.srem("allowed_origins", origin);
    
    // Remove metadata
    await redis.del(`origin:${origin}:added_at`);
    await redis.del(`origin:${origin}:last_used`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Sites DELETE error:", err);
    return NextResponse.json({ error: "Failed to remove site" }, { status: 500 });
  }
}
