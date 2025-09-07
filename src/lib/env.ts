// Simple environment variable access - no validation at module load
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  STEAM_API_KEY: process.env.STEAM_API_KEY || '',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean) : [],
};
