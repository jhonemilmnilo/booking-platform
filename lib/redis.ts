import Redis from "ioredis"

let redis: Redis | null = null

const redisUrl = process.env.REDIS_URL

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000, // 2 seconds timeout for fast failover
    })

    redis.on("error", (err) => {
      console.warn("[Redis] Connection warning:", err.message)
    })
  } catch (error) {
    console.warn("[Redis] Initialization failed:", error)
    redis = null
  }
} else {
  console.info("[Redis] REDIS_URL not configured. Running in Database fallback mode.")
}

export { redis }
