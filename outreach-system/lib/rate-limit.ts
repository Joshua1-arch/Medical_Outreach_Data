/**
 * lib/rate-limit.ts
 *
 * Rate limiting utility using Upstash Redis.
 * Perfect for Vercel / Serverless environments where local memory is not shared.
 *
 * Prerequisites:
 * 1. Create a free Redis database at https://upstash.com
 * 2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env.local
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Create a new ratelimiter, that allows 5 requests per 60 seconds (for public form spam)
export const submissionRateLimit = (redisUrl && redisToken) 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "@upstash/ratelimit/outreach",
    })
  : {
      // Fallback for development if Upstash is not yet configured
      limit: async () => ({ success: true, remaining: 999, reset: 0, limit: 999 })
    };

/**
 * Helper to get the client IP address from request headers.
 * Works with Next.js Server Actions and Route Handlers.
 */
export async function getIP() {
  const { headers } = require("next/headers");
  const headerList = await headers();
  
  // Vercel / Cloudflare / Nginx standard headers
  const forwarded = headerList.get("x-forwarded-for");
  const realIP = headerList.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return "127.0.0.1";
}

/**
 * Usage Example in a Server Action:
 * 
 * import { submissionRateLimit, getIP } from "@/lib/rate-limit";
 * 
 * export async function submitForm(formData: FormData) {
 *   const ip = getIP();
 *   const { success, limit, reset, remaining } = await submissionRateLimit.limit(ip);
 * 
 *   if (!success) {
 *     return { 
 *       success: false, 
 *       message: "Too many requests. Please try again in a few seconds." 
 *     };
 *   }
 * 
 *   // ... rest of your logic
 * }
 */
