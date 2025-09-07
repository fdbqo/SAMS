import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AdminAuth } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("admin_session")?.value;
    
    if (sessionId) {
      // Remove admin session from Redis
      await AdminAuth.invalidateSession(sessionId);
    }

    const response = NextResponse.json({ success: true });
    
    // Clear admin session cookie
    response.cookies.set("admin_session", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
    });

    return response;
  } catch (err: any) {
    console.error("Admin logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
