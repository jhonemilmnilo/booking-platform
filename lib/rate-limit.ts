import prisma from "@/lib/prisma/client"
import { headers } from "next/headers"
import { redis } from "@/lib/redis"

/**
 * Gets the client IP address from the request headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers()
    // 1. Vercel trusted header (secure and cannot be spoofed by client)
    const xVercelForwardedFor = headersList.get("x-vercel-forwarded-for")
    if (xVercelForwardedFor) {
      return xVercelForwardedFor.split(",")[0].trim()
    }
    // 2. Real IP header
    const xRealIp = headersList.get("x-real-ip")
    if (xRealIp) {
      return xRealIp.trim()
    }
    // 3. Fallback header
    const xForwardedFor = headersList.get("x-forwarded-for")
    if (xForwardedFor) {
      return xForwardedFor.split(",")[0].trim()
    }
    return "127.0.0.1"
  } catch {
    // Fallback for non-request environments
    return "127.0.0.1"
  }
}

/**
 * Universal Rate Limiter backed by Prisma.
 * Works perfectly in serverless, HMR, and server environments.
 * 
 * @param key The unique identifier key (e.g. "otp:email:ip")
 * @param maxAttempts Max allowed attempts within the window
 * @param windowMs Time window in milliseconds
 * @returns Object indicating if request is successful, remaining attempts, and reset time
 */
export async function isRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; resetTime?: Date }> {
  const now = new Date()

  // Try Redis first if it's initialized and ready
  if (redis && redis.status === "ready") {
    try {
      const current = await redis.get(key)
      if (current && parseInt(current, 10) >= maxAttempts) {
        const ttl = await redis.ttl(key)
        const resetTime = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : windowMs))
        return { success: false, remaining: 0, resetTime }
      }

      const multi = redis.multi()
      multi.incr(key)
      if (!current) {
        multi.pexpire(key, windowMs)
      }
      const results = await multi.exec()
      const newCount = results && results[0] && results[0][1] ? (results[0][1] as number) : 1

      return {
        success: newCount <= maxAttempts,
        remaining: Math.max(0, maxAttempts - newCount)
      }
    } catch (error) {
      console.warn("[RateLimit] Redis command failed, falling back to database:", error)
    }
  }

  // 1. Self-Cleaning: Delete all expired entries to prevent database bloating
  try {
    await prisma.rateLimit.deleteMany({
      where: { expiresAt: { lt: now } }
    })
  } catch (e) {
    console.warn("[RateLimit] Clean up warning:", e)
  }

  try {
    const record = await prisma.rateLimit.findUnique({
      where: { key }
    })

    // 2. No record exists: create new entry
    if (!record) {
      const expiresAt = new Date(now.getTime() + windowMs)
      await prisma.rateLimit.create({
        data: {
          key,
          attempts: 1,
          expiresAt
        }
      })
      return { success: true, remaining: maxAttempts - 1 }
    }

    // 3. Record exists but expired: reset window
    if (record.expiresAt < now) {
      const expiresAt = new Date(now.getTime() + windowMs)
      await prisma.rateLimit.update({
        where: { key },
        data: {
          attempts: 1,
          expiresAt
        }
      })
      return { success: true, remaining: maxAttempts - 1 }
    }

    // 4. Rate limit exceeded
    if (record.attempts >= maxAttempts) {
      return { success: false, remaining: 0, resetTime: record.expiresAt }
    }

    // 5. Within limit: increment attempts
    await prisma.rateLimit.update({
      where: { key },
      data: {
        attempts: record.attempts + 1
      }
    })

    return { success: true, remaining: maxAttempts - (record.attempts + 1) }
  } catch (error) {
    console.error("[RateLimit] Database error:", error)
    // Fail-open strategy: If the database is under load, don't lock out legitimate users
    return { success: true, remaining: 1 }
  }
}
