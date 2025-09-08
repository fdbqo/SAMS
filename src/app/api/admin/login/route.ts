import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENV } from "@/lib/env";
import { AdminAuth } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimiter";
import { AuditLogger } from "@/lib/auditLogger";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for admin login
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-real-ip")?.trim() ||
               "unknown";
    const tooMany = await rateLimit(`rl:admin_login:${ip}`, 5, 300); // 5 attempts per 5 minutes
    if (tooMany) {
      return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });
    }
    
    const { password, isSetup } = await request.json();
    const userAgent = request.headers.get("user-agent");
    
    if (!password) {
      await AuditLogger.logAdminAction("login_attempt", ip, userAgent, { error: "No password provided" }, false);
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    // Check if this is a setup request (first-time password setting)
    if (isSetup) {
      const passwordSet = await AdminAuth.isPasswordSet();
      if (passwordSet) {
        await AuditLogger.logAdminAction("setup_attempt", ip, userAgent, { error: "Password already set" }, false);
        return NextResponse.json({ error: "Admin password already set" }, { status: 400 });
      }
      
      const success = await AdminAuth.setPassword(password);
      if (!success) {
        await AuditLogger.logAdminAction("setup_attempt", ip, userAgent, { error: "Failed to set password" }, false);
        return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
      }
      
      await AuditLogger.logAdminAction("setup_success", ip, userAgent, { success: true });
    } else {
      // Regular login - verify password
      const isValid = await AdminAuth.verifyPassword(password);
      if (!isValid) {
        await AuditLogger.logAdminAction("login_attempt", ip, userAgent, { error: "Invalid password" }, false);
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
      
      await AuditLogger.logAdminAction("login_success", ip, userAgent, { success: true });
    }

    // Create admin session
    const sessionId = await AdminAuth.createSession();

    const response = NextResponse.json({ 
      success: true, 
      isSetup: !!isSetup 
    });
    
    response.cookies.set("admin_session", sessionId, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
