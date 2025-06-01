import { Redis } from "@upstash/redis";
import { getEnv } from "@/lib/env";

const ENV = getEnv();

export const redis = new Redis({
  url: ENV.UPSTASH_REDIS_REST_URL,
  token: ENV.UPSTASH_REDIS_REST_TOKEN,
});
