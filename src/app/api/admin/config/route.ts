import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENV } from "@/lib/env";
import { redis } from "@/lib/upstash";
import { verifyAdminAuth, checkAdminSetup } from "@/lib/adminMiddleware";

export async function GET(request: NextRequest) {
  try {
    // Check if admin setup is needed
    const { needsSetup } = await checkAdminSetup();
    if (needsSetup) {
      return NextResponse.json({ 
        needsSetup: true,
        message: "Admin password not set. Please complete setup first."
      }, { status: 200 });
    }

    // Verify admin authentication
    const authError = await verifyAdminAuth(request);
    if (authError) {
      return authError;
    }

    // Use environment for config display

    // Test Redis connection
    let redisConnected = false;
    try {
      await redis.ping();
      redisConnected = true;
    } catch {
      redisConnected = false;
    }

    return NextResponse.json({
      steamApiKey: ENV.STEAM_API_KEY || '',
      authServiceUrl: ENV.AUTH_SERVICE_URL || '',
      jwtSecret: ENV.JWT_SECRET ? '••••••••••••••••' : '',
      redisConnected,
      nodeEnv: ENV.NODE_ENV || 'development',
      needsSetup: false,
    });
  } catch (err: any) {
    console.error("Config error:", err);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}
