import Redis from "ioredis"

let redis: Redis | null = null

const redisUrl = process.env.REDIS_URL?.trim()

// Only attempt Redis connection if REDIS_URL is provided, valid, and not commented out
if (redisUrl && !redisUrl.startsWith("#") && !redisUrl.startsWith("//")) {
  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 1500,
      enableOfflineQueue: false, // Never stall or queue commands while disconnected
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 1) {
          console.warn("[Redis] Host unreachable. Terminating reconnection and switching to Database fallback mode.")
          try {
            client.disconnect()
          } catch {}
          redis = null
          return null // Stop further reconnection attempts
        }
        return 500
      },
    })

    client.on("error", (err: Error & { code?: string }) => {
      if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED" || err.message?.includes("ENOTFOUND")) {
        console.warn(`[Redis] Connection failed (${err.code || err.message}). Deactivating Redis to use Prisma Database fallback.`)
        try {
          client.disconnect()
        } catch {}
        redis = null
      } else {
        console.warn("[Redis] Warning:", err.message)
      }
    })

    client.on("ready", () => {
      console.info("[Redis] Connection established and ready.")
    })

    redis = client
  } catch (error) {
    console.warn("[Redis] Initialization failed, using Database fallback:", error)
    redis = null
  }
} else {
  console.info("[Redis] REDIS_URL not active. Running in Database fallback mode.")
}

export function isRedisAvailable(): boolean {
  return redis !== null && redis.status === "ready"
}

export { redis }
