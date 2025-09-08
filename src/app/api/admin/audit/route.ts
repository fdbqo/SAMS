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

    // Get limit from query params
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const maxLimit = Math.min(limit, 200); // Cap at 200 entries

    const logs = await AuditLogger.getRecentLogs(maxLimit);
    
    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("Audit logs error:", err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
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

    await AuditLogger.clearLogs();
    
    // Log the action
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip")?.trim() ||
               "unknown";
    const userAgent = request.headers.get("user-agent");
    await AuditLogger.logAdminAction("audit_logs_cleared", ip, userAgent, {});
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Clear audit logs error:", err);
    return NextResponse.json({ error: "Failed to clear audit logs" }, { status: 500 });
  }
}
