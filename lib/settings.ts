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
 * Fetch multiple system settings in a single batch.
 * Queries Redis using MGET, falls back to PostgreSQL in a single query for missing keys, and caches any misses.
 */
export async function getSystemSettings(
  keys: string[],
  defaultValues: Record<string, string>
): Promise<Record<string, string>> {
  const results: Record<string, string> = { ...defaultValues }
  
  if (keys.length === 0) return results

  const cacheKeys = keys.map((key) => `setting:${key}`)
  let cachedValues: (string | null)[] = []

  if (redis && redis.status === "ready") {
    try {
      cachedValues = await redis.mget(cacheKeys)
    } catch (err) {
      console.warn("[Settings] Redis MGET failed, falling back to database", err)
      cachedValues = new Array(keys.length).fill(null)
    }
  } else {
    cachedValues = new Array(keys.length).fill(null)
  }

  const missingKeys: string[] = []

  for (let i = 0; i < keys.length; i++) {
    const val = cachedValues[i]
    if (val !== null) {
      results[keys[i]] = val
    } else {
      missingKeys.push(keys[i])
    }
  }

  if (missingKeys.length > 0) {
    try {
      const records = await prisma.systemSettings.findMany({
        where: { key: { in: missingKeys } }
      })

      const recordMap = new Map(records.map((r) => [r.key, r.value]))
      const toCache: Record<string, string> = {}

      for (const key of missingKeys) {
        const val = recordMap.get(key)
        if (val !== undefined) {
          results[key] = val
          toCache[`setting:${key}`] = val
        }
      }

      // Batch cache missing keys to Redis
      if (redis && redis.status === "ready" && Object.keys(toCache).length > 0) {
        try {
          await redis.mset(toCache)
        } catch {
          // Ignore cache write errors
        }
      }
    } catch (error) {
      console.error("[Settings] Failed to batch fetch system settings from database", error)
    }
  }

  return results
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
