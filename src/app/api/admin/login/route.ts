import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENV } from "@/lib/env";
import { AdminAuth } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const { password, isSetup } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    // Check if this is a setup request (first-time password setting)
    if (isSetup) {
      const passwordSet = await AdminAuth.isPasswordSet();
      if (passwordSet) {
        return NextResponse.json({ error: "Admin password already set" }, { status: 400 });
      }
      
      const success = await AdminAuth.setPassword(password);
      if (!success) {
        return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
      }
    } else {
      // Regular login - verify password
      const isValid = await AdminAuth.verifyPassword(password);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
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
