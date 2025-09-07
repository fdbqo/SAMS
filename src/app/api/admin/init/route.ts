import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENV } from "@/lib/env";
import { redis } from "@/lib/upstash";
import { verifyAdminAuth } from "@/lib/adminMiddleware";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authError = await verifyAdminAuth(request);
    if (authError) {
      return authError;
    }

    // Check if already initialized
    const existingOrigins = await redis.smembers("allowed_origins");
    if (existingOrigins.length > 0) {
      return NextResponse.json({ 
        message: "Already initialized", 
        origins: existingOrigins 
      });
    }

    // Initialize with origins from environment variables
    const origins = ENV.ALLOWED_ORIGINS;
    
    if (origins.length > 0) {
      for (const origin of origins) {
        await redis.sadd("allowed_origins", origin);
        await redis.set(`origin:${origin}:added_at`, new Date().toISOString());
      }
    }

    const newOrigins = await redis.smembers("allowed_origins");
    
    return NextResponse.json({ 
      message: "Initialized successfully", 
      origins: newOrigins 
    });
  } catch (err: any) {
    console.error("Init error:", err);
    return NextResponse.json({ error: "Failed to initialize" }, { status: 500 });
  }
}
