import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });

async function testUpstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log("Checking Upstash Configuration...");
  console.log("URL:", url ? "Set" : "Missing");
  console.log("Token:", token ? "Set" : "Missing");

  if (!url || !token) {
    console.error("Error: Upstash environment variables are missing.");
    process.exit(1);
  }

  try {
    const redis = Redis.fromEnv();
    
    console.log("\n1. Testing Redis Connection (PING)...");
    const pingResponse = await redis.ping();
    console.log("Response:", pingResponse);

    if (pingResponse === "PONG") {
      console.log("✅ Redis connection successful!");
    }

    console.log("\n2. Testing Rate Limiter...");
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "@test/ratelimit",
    });

    const identifier = "test-user-id";
    const result = await ratelimit.limit(identifier);

    console.log("Rate Limit Result:", {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset).toLocaleTimeString(),
    });

    if (result.success) {
      console.log("✅ Rate limiter logic successful!");
    }

    console.log("\nEverything is working correctly with Upstash!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Upstash connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testUpstash();
