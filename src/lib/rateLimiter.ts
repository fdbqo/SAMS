import { redis } from "@/lib/upstash";

export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<boolean> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSec);
  }
  return count > limit;
}
