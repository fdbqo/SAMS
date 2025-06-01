import { z } from "zod";

const _env = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  STEAM_API_KEY: z.string().nonempty(),
  AUTH_SERVICE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().nonempty(),

  ALLOWED_ORIGINS: z
    .string()
    .nonempty()
    .transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)),
});

export function getEnv() {
  return _env.parse(process.env);
}
