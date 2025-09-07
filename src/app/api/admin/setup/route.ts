import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AdminAuth } from "@/lib/adminAuth";

export async function GET() {
  try {
    const isSetup = await AdminAuth.isPasswordSet();
    return NextResponse.json({ 
      isSetup,
      needsSetup: !isSetup 
    });
  } catch (error) {
    console.error("Setup check error:", error);
    return NextResponse.json({ error: "Failed to check setup status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long" 
      }, { status: 400 });
    }

    // Check if password is already set
    const isSetup = await AdminAuth.isPasswordSet();
    if (isSetup) {
      return NextResponse.json({ 
        error: "Admin password already set" 
      }, { status: 400 });
    }

    // Set the password
    const success = await AdminAuth.setPassword(password);
    if (!success) {
      return NextResponse.json({ 
        error: "Failed to set admin password" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Admin password set successfully" 
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
