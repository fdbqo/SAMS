import { redis } from "@/lib/upstash";

export interface AuditLogEntry {
  timestamp: number;
  action: string;
  ip: string;
  userAgent?: string;
  details?: Record<string, any>;
  success: boolean;
}

const AUDIT_LOG_KEY = "audit_logs";
const MAX_AUDIT_LOGS = 1000; // Keep last 1000 entries

export class AuditLogger {
  /**
   * Log an admin action
   */
  static async logAdminAction(
    action: string,
    ip: string,
    userAgent: string | null,
    details: Record<string, any> = {},
    success: boolean = true
  ): Promise<void> {
    try {
      const entry: AuditLogEntry = {
        timestamp: Date.now(),
        action,
        ip,
        userAgent: userAgent || undefined,
        details,
        success
      };

      // Add to the beginning of the list
      await redis.lpush(AUDIT_LOG_KEY, JSON.stringify(entry));
      
      // Trim to keep only the last MAX_AUDIT_LOGS entries
      await redis.ltrim(AUDIT_LOG_KEY, 0, MAX_AUDIT_LOGS - 1);
      
      // Set expiration (30 days)
      await redis.expire(AUDIT_LOG_KEY, 30 * 24 * 60 * 60);
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  }

  /**
   * Get recent audit logs
   */
  static async getRecentLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    try {
      const logs = await redis.lrange(AUDIT_LOG_KEY, 0, limit - 1);
      return logs.map(log => JSON.parse(log)).filter(Boolean);
    } catch (error) {
      console.error("Failed to get audit logs:", error);
      return [];
    }
  }

  /**
   * Clear all audit logs
   */
  static async clearLogs(): Promise<void> {
    try {
      await redis.del(AUDIT_LOG_KEY);
    } catch (error) {
      console.error("Failed to clear audit logs:", error);
    }
  }
}
