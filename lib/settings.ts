import prisma from "@/lib/prisma/client"
import { redis } from "@/lib/redis"

/**
 * Fetch a system setting.
 * Queries Redis cache first, falling back to PostgreSQL, and caches the result.
 */
export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  const cacheKey = `setting:${key}`

  if (redis && redis.status === "ready") {
    try {
      const cached = await redis.get(cacheKey)
      if (cached !== null) {
        return cached
      }
    } catch {
      // Fail-silent, fallback below
    }
  }

  try {
    const record = await prisma.systemSettings.findUnique({ where: { key } })
    if (record) {
      if (redis && redis.status === "ready") {
        try {
          await redis.set(cacheKey, record.value)
        } catch {
          // Ignore cache write errors
        }
      }
      return record.value
    }
  } catch (error) {
    console.error(`[Settings] Failed to fetch system setting: ${key}`, error)
  }

  return defaultValue
}

/**
 * Update a system setting.
 * Writes to PostgreSQL and updates the Redis cache.
 */
export async function setSystemSetting(key: string, value: string): Promise<void> {
  const cacheKey = `setting:${key}`

  try {
    await prisma.systemSettings.upsert({
      where: { key },
      create: { key, value },
      update: { value }
    })

    if (redis && redis.status === "ready") {
      try {
        await redis.set(cacheKey, value)
      } catch {
        // Ignore cache write errors
      }
    }
  } catch (error) {
    console.error(`[Settings] Failed to save system setting: ${key}`, error)
    throw error
  }
}
