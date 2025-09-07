import { NextRequest, NextResponse } from "next/server";
import { AdminAuth } from "@/lib/adminAuth";

export async function verifyAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    const sessionId = request.cookies.get("admin_session")?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: "Admin session required" }, { status: 401 });
    }

    const isValid = await AdminAuth.verifySession(sessionId);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid admin session" }, { status: 401 });
    }

    return null; // Auth successful, continue
  } catch (error) {
    console.error("Admin auth verification error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function checkAdminSetup(): Promise<{ isSetup: boolean; needsSetup: boolean }> {
  try {
    const isSetup = await AdminAuth.isPasswordSet();
    return { isSetup, needsSetup: !isSetup };
  } catch (error) {
    console.error("Error checking admin setup:", error);
    return { isSetup: false, needsSetup: true };
  }
}
