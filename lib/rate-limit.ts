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

  // Try Redis first if it's initialized
  if (redis) {
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

/**
 * Progressive OTP send rate-limiting module.
 * Tier 1: 3 attempts, cooldown 3 minutes.
 * Tier 2: 2 attempts, cooldown 5 minutes.
 * Tier 3: 1 attempt, cooldown 1 hour.
 */

export async function getOtpSendTier(email: string): Promise<number> {
  const key = `otp:tier:${email}`
  if (redis) {
    try {
      const val = await redis.get(key)
      return val ? parseInt(val, 10) : 1
    } catch {
      // Fallback below
    }
  }

  try {
    const record = await prisma.rateLimit.findUnique({ where: { key } })
    if (record && record.expiresAt > new Date()) {
      return record.attempts
    }
  } catch (error) {
    console.error("[RateLimit] Error getting OTP tier:", error)
  }
  return 1
}

export async function incrementOtpSendAttempts(
  email: string
): Promise<{ locked: boolean; cooldownMs: number; remaining: number }> {
  const tier = await getOtpSendTier(email)
  
  // Set configuration based on current tier
  let maxAttempts = 3
  let cooldownMs = 180000
  
  if (tier === 2) {
    maxAttempts = 2
    cooldownMs = 300000
  } else if (tier >= 3) {
    maxAttempts = 1
    cooldownMs = 3600000
  }

  const attemptsKey = `otp:send_attempts:${email}`
  let currentAttempts = 0

  let redisAttemptsSuccess = false
  if (redis) {
    try {
      const val = await redis.get(attemptsKey)
      currentAttempts = val ? parseInt(val, 10) : 0
      redisAttemptsSuccess = true
    } catch {
      // Fallback below
    }
  }
  
  if (!redisAttemptsSuccess) {
    try {
      const record = await prisma.rateLimit.findUnique({ where: { key: attemptsKey } })
      if (record && record.expiresAt > new Date()) {
        currentAttempts = record.attempts
      }
    } catch (error) {
      console.error("[RateLimit] Error getting send attempts:", error)
    }
  }

  const nextAttempts = currentAttempts + 1

  if (nextAttempts > maxAttempts) {
    // Lock them out!
    const lockoutExpiry = new Date(Date.now() + cooldownMs)
    const lockoutKey = `otp:send_lockout:${email}`
    const nextTier = Math.min(3, tier + 1)
    const tierKey = `otp:tier:${email}`

    let redisLockoutSuccess = false
    if (redis) {
      try {
        const multi = redis.multi()
        multi.set(lockoutKey, lockoutExpiry.getTime().toString(), "PX", cooldownMs)
        multi.set(tierKey, nextTier.toString(), "PX", 86400000)
        multi.del(attemptsKey)
        await multi.exec()
        redisLockoutSuccess = true
      } catch (error) {
        console.warn("[RateLimit] Redis lockout multi block failed:", error)
      }
    }
    
    if (!redisLockoutSuccess) {
      try {
        await prisma.$transaction([
          prisma.rateLimit.upsert({
            where: { key: lockoutKey },
            create: { key: lockoutKey, attempts: 1, expiresAt: lockoutExpiry },
            update: { attempts: 1, expiresAt: lockoutExpiry }
          }),
          prisma.rateLimit.upsert({
            where: { key: tierKey },
            create: { key: tierKey, attempts: nextTier, expiresAt: new Date(Date.now() + 86400000) },
            update: { attempts: nextTier, expiresAt: new Date(Date.now() + 86400000) }
          }),
          prisma.rateLimit.deleteMany({
            where: { key: attemptsKey }
          })
        ])
      } catch (error) {
        console.error("[RateLimit] Database lockout transaction failed:", error)
      }
    }
    return { locked: true, cooldownMs, remaining: 0 }
  }

  // Increment attempt counter
  let redisIncrementSuccess = false
  if (redis) {
    try {
      const multi = redis.multi()
      multi.incr(attemptsKey)
      if (currentAttempts === 0) {
        multi.pexpire(attemptsKey, 3600000)
      }
      await multi.exec()
      redisIncrementSuccess = true
    } catch (error) {
      console.warn("[RateLimit] Redis increment failed:", error)
    }
  }
  
  if (!redisIncrementSuccess) {
    try {
      await prisma.rateLimit.upsert({
        where: { key: attemptsKey },
        create: { key: attemptsKey, attempts: 1, expiresAt: new Date(Date.now() + 3600000) },
        update: { attempts: nextAttempts, expiresAt: new Date(Date.now() + 3600000) }
      })
    } catch (error) {
      console.error("[RateLimit] Database increment failed:", error)
    }
  }

  return { locked: false, cooldownMs: 0, remaining: maxAttempts - nextAttempts }
}

export async function resetOtpSendLimits(email: string): Promise<void> {
  const keys = [`otp:tier:${email}`, `otp:send_attempts:${email}`, `otp:send_lockout:${email}`]
  if (redis) {
    try {
      await redis.del(...keys)
    } catch {
      // Fallback below
    }
  }

  try {
    await prisma.rateLimit.deleteMany({
      where: { key: { in: keys } }
    })
  } catch (error) {
    console.error("[RateLimit] Database reset failed:", error)
  }
}

export async function isOtpSendLimitReached(email: string): Promise<boolean> {
  try {
    const tier = await getOtpSendTier(email)
    let maxAttempts = 3
    if (tier === 2) {
      maxAttempts = 2
    } else if (tier >= 3) {
      maxAttempts = 1
    }

    const attemptsKey = `otp:send_attempts:${email}`
    let currentAttempts = 0

    if (redis && redis.status === "ready") {
      const val = await redis.get(attemptsKey)
      currentAttempts = val ? parseInt(val, 10) : 0
    } else {
      const record = await prisma.rateLimit.findUnique({
        where: { key: attemptsKey },
        select: { attempts: true, expiresAt: true }
      })
      if (record && record.expiresAt > new Date()) {
        currentAttempts = record.attempts
      }
    }

    return currentAttempts >= maxAttempts
  } catch (error) {
    console.error("[RateLimit] Error checking if OTP send limit is reached:", error)
    return false
  }
}

/**
 * Mask email address to secure PII in system logs.
 * e.g., "jhonemil@example.com" -> "j*******@example.com"
 */
export function maskEmail(email: string): string {
  const parts = email.split("@")
  if (parts.length !== 2) return "invalid-email"
  const [username, domain] = parts
  if (username.length <= 2) return `${username.charAt(0)}***@${domain}`
  return `${username.charAt(0)}${"*".repeat(username.length - 1)}@${domain}`
}

/**
 * Universal lockout checker that queries Redis first and falls back to Postgres.
 */
export async function checkLockout(key: string): Promise<{ active: boolean; remainingMs: number }> {
  const now = Date.now()
  if (redis) {
    try {
      const ttl = await redis.ttl(key)
      if (ttl > 0) {
        return { active: true, remainingMs: ttl * 1000 }
      }
      return { active: false, remainingMs: 0 }
    } catch {
      // Fallback below
    }
  }

  try {
    const record = await prisma.rateLimit.findUnique({ where: { key } })
    if (record && record.expiresAt > new Date()) {
      return { active: true, remainingMs: record.expiresAt.getTime() - now }
    }
  } catch (error) {
    console.error("[RateLimit] Lockout check failed:", error)
  }
  return { active: false, remainingMs: 0 }
}

/**
 * Checks if an active OTP has been sent and is not yet expired.
 */
export async function hasActiveOtp(email: string): Promise<boolean> {
  const key = `otp:active_state:${email}`
  if (redis) {
    try {
      const exists = await redis.exists(key)
      return exists === 1
    } catch (error) {
      console.warn("[RateLimit] Redis hasActiveOtp check failed, falling back to database:", error)
    }
  }

  try {
    const record = await prisma.rateLimit.findUnique({ where: { key } })
    return !!record && record.expiresAt > new Date()
  } catch (error) {
    console.error("[RateLimit] Database hasActiveOtp check failed:", error)
    return false
  }
}

/**
 * Sets the active OTP state tracking key in Redis (or DB fallback).
 */
export async function setActiveOtp(email: string, durationMs: number): Promise<void> {
  const key = `otp:active_state:${email}`
  const expiresAt = new Date(Date.now() + durationMs)
  if (redis) {
    try {
      await redis.set(key, "active", "PX", durationMs)
      return
    } catch (error) {
      console.warn("[RateLimit] Redis setActiveOtp failed, falling back to database:", error)
    }
  }

  try {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, attempts: 1, expiresAt },
      update: { expiresAt }
    })
  } catch (error) {
    console.error("[RateLimit] Database setActiveOtp failed:", error)
  }
}

/**
 * Checks if the user is authorized to perform OTP verification (OTP access token).
 */
export async function hasOtpAccess(email: string): Promise<boolean> {
  const key = `otp:access:${email}`
  if (redis) {
    try {
      const exists = await redis.exists(key)
      return exists === 1
    } catch (error) {
      console.warn("[RateLimit] Redis hasOtpAccess check failed, falling back to database:", error)
    }
  }

  try {
    const record = await prisma.rateLimit.findUnique({ where: { key } })
    return !!record && record.expiresAt > new Date()
  } catch (error) {
    console.error("[RateLimit] Database hasOtpAccess check failed:", error)
    return false
  }
}

/**
 * Sets the OTP access token/flag in Redis (or DB fallback).
 */
export async function setOtpAccess(email: string, durationMs: number): Promise<void> {
  const key = `otp:access:${email}`
  const expiresAt = new Date(Date.now() + durationMs)
  if (redis) {
    try {
      await redis.set(key, "allowed", "PX", durationMs)
      return
    } catch (error) {
      console.warn("[RateLimit] Redis setOtpAccess failed, falling back to database:", error)
    }
  }

  try {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, attempts: 1, expiresAt },
      update: { expiresAt }
    })
  } catch (error) {
    console.error("[RateLimit] Database setOtpAccess failed:", error)
  }
}

/**
 * Clears the active OTP state and access tokens (e.g. upon successful verification).
 */
export async function clearOtpStates(email: string): Promise<void> {
  const keys = [`otp:active_state:${email}`, `otp:access:${email}`]
  if (redis) {
    try {
      await redis.del(...keys)
      return
    } catch (error) {
      console.warn("[RateLimit] Redis clearOtpStates failed, falling back to database:", error)
    }
  }

  try {
    await prisma.rateLimit.deleteMany({
      where: { key: { in: keys } }
    })
  } catch (error) {
    console.error("[RateLimit] Database clearOtpStates failed:", error)
  }
}

