import { redis } from "@/lib/upstash";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const ADMIN_PASSWORD_KEY = "admin:password";
const ADMIN_SESSION_KEY = "admin:session";

export class AdminAuth {
  /**
   * Check if admin password is set in Redis
   */
  static async isPasswordSet(): Promise<boolean> {
    try {
      const password = await redis.get(ADMIN_PASSWORD_KEY);
      return password !== null;
    } catch (error) {
      console.error("Error checking admin password:", error);
      return false;
    }
  }

  /**
   * Set the admin password (first-time setup)
   */
  static async setPassword(password: string): Promise<boolean> {
    try {
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      // Hash the password with salt
      const salt = randomBytes(16);
      const hash = await scryptAsync(password, salt, 64) as Buffer;
      const hashedPassword = salt.toString('hex') + ':' + hash.toString('hex');
      
      await redis.set(ADMIN_PASSWORD_KEY, hashedPassword);
      return true;
    } catch (error) {
      console.error("Error setting admin password:", error);
      return false;
    }
  }

  /**
   * Verify admin password
   */
  static async verifyPassword(password: string): Promise<boolean> {
    try {
      const storedPassword = await redis.get(ADMIN_PASSWORD_KEY);
      if (!storedPassword) {
        return false;
      }
      
      // Check if it's the old plain text format (for migration)
      if (!storedPassword.includes(':')) {
        // This is a plain text password, migrate it
        console.warn("Migrating plain text admin password to hashed format");
        await this.setPassword(password);
        return true;
      }
      
      // Verify hashed password
      const [saltHex, hashHex] = storedPassword.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      const hash = Buffer.from(hashHex, 'hex');
      
      const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
      return timingSafeEqual(hash, derivedKey);
    } catch (error) {
      console.error("Error verifying admin password:", error);
      return false;
    }
  }

  /**
   * Create admin session
   */
  static async createSession(): Promise<string> {
    try {
      // Clean up any old admin sessions first
      const oldSessionKeys = await redis.keys("admin:session:*");
      if (oldSessionKeys.length > 0) {
        await redis.del(...oldSessionKeys);
      }

      // Create new session with cryptographically secure random ID
      const sessionId = randomBytes(32).toString('hex');
      await redis.set(`${ADMIN_SESSION_KEY}:${sessionId}`, "admin", { ex: 24 * 60 * 60 }); // 24 hours
      
      return sessionId;
    } catch (error) {
      console.error("Error creating admin session:", error);
      throw error;
    }
  }

  /**
   * Verify admin session
   */
  static async verifySession(sessionId: string): Promise<boolean> {
    try {
      if (!sessionId) {
        return false;
      }
      
      const session = await redis.get(`${ADMIN_SESSION_KEY}:${sessionId}`);
      return session === "admin";
    } catch (error) {
      console.error("Error verifying admin session:", error);
      return false;
    }
  }

  /**
   * Invalidate admin session
   */
  static async invalidateSession(sessionId: string): Promise<void> {
    try {
      if (sessionId) {
        await redis.del(`${ADMIN_SESSION_KEY}:${sessionId}`);
      }
    } catch (error) {
      console.error("Error invalidating admin session:", error);
    }
  }

  /**
   * Invalidate all admin sessions
   */
  static async invalidateAllSessions(): Promise<void> {
    try {
      const sessionKeys = await redis.keys(`${ADMIN_SESSION_KEY}:*`);
      if (sessionKeys.length > 0) {
        await redis.del(...sessionKeys);
      }
    } catch (error) {
      console.error("Error invalidating all admin sessions:", error);
    }
  }
}
