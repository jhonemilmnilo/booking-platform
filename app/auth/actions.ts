"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import prisma from "@/lib/prisma/client"
import { redis } from "@/lib/redis"
import {
  isRateLimited,
  incrementOtpSendAttempts,
  maskEmail,
  checkLockout,
  hasActiveOtp,
  setActiveOtp,
  hasOtpAccess,
  setOtpAccess,
  isOtpSendLimitReached,
  getOtpStatus,
  clearAllRateLimits
} from "@/lib/rate-limit"
import { revalidatePath } from "next/cache"
import { getSystemSetting, setSystemSetting, getSystemSettings } from "@/lib/settings"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
})

export async function loginWithEmailAction(formData: z.infer<typeof loginSchema>) {
  try {
    const parsed = loginSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { email, password } = parsed.data
    const emailClean = email.trim().toLowerCase()
    const supabase = await createClient()

    // 1. Check if locked out
    const lockoutKey = `pw:lockout:${emailClean}`
    const existingLockout = await prisma.rateLimit.findUnique({
      where: { key: lockoutKey }
    })
    const now = new Date()
    if (existingLockout && existingLockout.expiresAt > now) {
      const minutesLeft = Math.ceil((existingLockout.expiresAt.getTime() - now.getTime()) / 60000)
      return {
        success: false,
        error: `Too many failed attempts! Login is locked for ${minutesLeft} minute(s).`,
        code: "lockout"
      }
    }

    // 1b. Check if locked out of OTP verification attempts
    const otpLockoutKey = `otp:lockout:${emailClean}`
    const existingOtpLockout = await prisma.rateLimit.findUnique({
      where: { key: otpLockoutKey }
    })
    if (existingOtpLockout && existingOtpLockout.expiresAt > now) {
      const elapsedMs = existingOtpLockout.expiresAt.getTime() - now.getTime()
      const minutes = Math.floor(elapsedMs / 60000)
      const seconds = Math.ceil((elapsedMs % 60000) / 1000)
      const timeString = minutes > 0 ? `${minutes} minute(s) and ${seconds} second(s)` : `${seconds} second(s)`
      return {
        success: false,
        error: `Too many incorrect verification attempts. Please try again in ${timeString}.`,
        code: "lockout"
      }
    }

    // 2. Validate Credentials
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Track failed attempts (Max 3 failed logins per 3 minutes)
      const failKey = `pw:fail:${emailClean}`
      const limitCheck = await isRateLimited(failKey, 3, 180000)
      if (!limitCheck.success || limitCheck.remaining === 0) {
        await prisma.rateLimit.upsert({
          where: { key: lockoutKey },
          create: { key: lockoutKey, attempts: 1, expiresAt: new Date(Date.now() + 180000) },
          update: { attempts: 1, expiresAt: new Date(Date.now() + 180000) }
        })
        return {
          success: false,
          error: "Too many failed attempts! Login is locked for 3 minutes.",
          code: "lockout"
        }
      }
      const attemptsLeft = limitCheck.remaining
      return {
        success: false,
        error: `Invalid email or password. You have ${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left.`
      }
    }

    // Clear fail tracker on success
    await prisma.rateLimit.deleteMany({
      where: { key: { in: [`pw:fail:${emailClean}`, lockoutKey] } }
    })

    // Check if user profile exists in database
    const exists = await prisma.user.findUnique({
      where: { email: emailClean }
    })

    if (!exists) {
      await supabase.auth.signOut()
      return {
        success: false,
        error: "Account not found. Please register an account before signing in."
      }
    }

    // Success! Clear any previous failed attempts or OTP limits
    await clearAllRateLimits(emailClean)

    console.info(`[Auth] User successfully logged in: ${maskEmail(emailClean)} (${exists.role})`)
    return { success: true, otpRequired: false, role: exists.role }
  } catch (error) {
    console.error("[Auth] Login error details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during login. Please try again."
    }
  }
}

export async function signUpWithEmailAction(formData: z.infer<typeof signUpSchema>) {
  try {
    const parsed = signUpSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { email, password, fullName } = parsed.data
    const emailClean = email.trim().toLowerCase()
    const supabase = await createClient()

    // Check if an active OTP has been sent and is not yet expired
    const activeOtp = await hasActiveOtp(emailClean)
    if (activeOtp) {
      // Authorize access to OTP verification page
      await setOtpAccess(emailClean, 300000)
      console.info(`[Auth] Active OTP found in Redis for signup email: ${maskEmail(emailClean)}. Skipping redundant email send.`)
      return { success: true, otpAlreadySent: true }
    }

    // Check if locked out of OTP verification attempts
    const otpLockoutKey = `otp:lockout:${emailClean}`
    const otpLockout = await checkLockout(otpLockoutKey)
    if (otpLockout.active) {
      const elapsedMs = otpLockout.remainingMs
      const minutes = Math.floor(elapsedMs / 60000)
      const seconds = Math.ceil((elapsedMs % 60000) / 1000)
      const timeString = minutes > 0 ? `${minutes} minute(s) and ${seconds} second(s)` : `${seconds} second(s)`
      return {
        success: false,
        error: `Too many incorrect verification attempts. Please try again in ${timeString}.`,
        code: "lockout"
      }
    }

    // Check progressive lockout for sending OTP
    const sendLockoutKey = `otp:send_lockout:${emailClean}`
    const sendLockout = await checkLockout(sendLockoutKey)
    if (sendLockout.active) {
      const elapsedMs = sendLockout.remainingMs
      const hours = Math.floor(elapsedMs / 3600000)
      const minutes = Math.floor((elapsedMs % 3600000) / 60000)
      const seconds = Math.ceil((elapsedMs % 60000) / 1000)

      let timeString = ""
      if (hours > 0) {
        timeString = `${hours} hour(s) and ${minutes} minute(s)`
      } else if (minutes > 0) {
        timeString = `${minutes} minute(s) and ${seconds} second(s)`
      } else {
        timeString = `${seconds} second(s)`
      }

      return {
        success: false,
        error: `Too many verification requests. Please try again in ${timeString}.`
      }
    }

    // Pre-check if send attempts limit is already reached to trigger lockout immediately
    const isLimitReached = await isOtpSendLimitReached(emailClean)
    if (isLimitReached) {
      const incrementResult = await incrementOtpSendAttempts(emailClean)
      if (incrementResult.locked) {
        const cooldownSec = incrementResult.cooldownMs / 1000
        const cooldownStr = cooldownSec >= 3600 ? "1 hour" : `${cooldownSec / 60} minutes`
        return {
          success: false,
          error: `Too many verification requests. Send limit reached. Please try again in ${cooldownStr}.`
        }
      }
    }

    // Increment send attempts
    const incrementResult = await incrementOtpSendAttempts(emailClean)
    if (incrementResult.locked) {
      const cooldownSec = incrementResult.cooldownMs / 1000
      const cooldownStr = cooldownSec >= 3600 ? "1 hour" : `${cooldownSec / 60} minutes`
      return {
        success: false,
        error: `Too many verification requests. Send limit reached. Please try again in ${cooldownStr}.`
      }
    }

    // Sign up in Supabase Auth (sends verification email code automatically)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      if (error.message.includes("For security purposes")) {
        await setActiveOtp(emailClean, 300000)
        await setOtpAccess(emailClean, 300000)
        return { success: true, user: data?.user, otpAlreadySent: true }
      }
      return { success: false, error: error.message }
    }

    // Save active OTP state and grant access in Redis
    await setActiveOtp(emailClean, 300000) // OTP valid for 5 minutes
    await setOtpAccess(emailClean, 300000) // Allow access to verify page for 5 minutes

    console.info(`[Auth] Signup OTP successfully requested for email: ${maskEmail(emailClean)}`)
    return { success: true, user: data.user }
  } catch (error) {
    console.error("[Auth] Signup error details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during signup. Please try again."
    }
  }
}

export async function verifyOtpAction(email: string, code: string) {
  try {
    const emailClean = email.trim().toLowerCase()
    const supabase = await createClient()

    // Check if the user is authorized to verify OTP (access flag in Redis)
    const hasAccess = await hasOtpAccess(emailClean)
    if (!hasAccess) {
      return {
        success: false,
        error: "Session expired or invalid. Please go back and sign in again."
      }
    }

    // 1. Check lockout status
    const lockoutKey = `otp:lockout:${emailClean}`
    const otpLockout = await checkLockout(lockoutKey)
    if (otpLockout.active) {
      const elapsedMs = otpLockout.remainingMs
      const minutes = Math.floor(elapsedMs / 60000)
      const seconds = Math.ceil((elapsedMs % 60000) / 1000)
      const timeString = minutes > 0 ? `${minutes} minute(s) and ${seconds} second(s)` : `${seconds} second(s)`
      return {
        success: false,
        error: `Too many incorrect OTP codes. Verification is locked for ${timeString}.`,
        code: "lockout"
      }
    }

    // Try verification (first signup type, then fallback to email login type)
    let { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup"
    })

    if (error) {
      const { data: retryData, error: retryError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email"
      })
      data = retryData
      error = retryError
    }

    if (error) {
      // Track failed attempts (Max 3 failed OTP entries per 3 minutes)
      const failKey = `otp:fail:${emailClean}`
      const limitCheck = await isRateLimited(failKey, 3, 180000)
      if (!limitCheck.success || limitCheck.remaining === 0) {
        await prisma.rateLimit.upsert({
          where: { key: lockoutKey },
          create: { key: lockoutKey, attempts: 1, expiresAt: new Date(Date.now() + 180000) },
          update: { attempts: 1, expiresAt: new Date(Date.now() + 180000) }
        })
        return {
          success: false,
          error: "Too many incorrect OTP codes. OTP verification is locked for 3 minutes.",
          code: "lockout"
        }
      }
      const attemptsLeft = limitCheck.remaining
      return {
        success: false,
        error: `Incorrect OTP code. You have ${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left.`
      }
    }

    // Success! Clear all rate limits (OTP resends, OTP entries, and password fail/lockout logs)
    await clearAllRateLimits(emailClean)

    // 2. Profile Syncing: Ensure profile exists in public.User table
    const user = data.user
    let role = "GUEST"
    if (user) {
      const exists = await prisma.user.findUnique({
        where: { id: user.id }
      })

      if (!exists) {
        // Create user record in our public table if it doesn't exist
        const newUser = await prisma.user.create({
          data: {
            id: user.id,
            email: user.email!,
            fullName: user.user_metadata["full_name"] || "New Guest",
            role: "GUEST"
          }
        })
        role = newUser.role
      } else {
        role = exists.role
      }
    }

    return { success: true, role }
  } catch (error) {
    console.error("[Auth] Verify OTP error details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred during OTP verification."
    }
  }
}

export async function getSocialLoginUrlAction(provider: "google" | "facebook", origin: string, isSignup?: boolean) {
  const supabase = await createClient()
  const redirectTo = isSignup
    ? `${origin}/auth/callback?signup=true`
    : `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, url: data.url }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}

export async function getOtpCooldownAction(email: string) {
  try {
    const emailClean = email.trim().toLowerCase()
    const otpCooldownKey = `otp:send:${emailClean}`

    // 1. Try Redis first
    if (redis && redis.status === "ready") {
      const ttl = await redis.ttl(otpCooldownKey)
      if (ttl > 0) {
        return { success: true, remainingSeconds: ttl }
      }
      return { success: true, remainingSeconds: 0 }
    }

    // 2. Database Fallback (RateLimit table)
    const record = await prisma.rateLimit.findUnique({
      where: { key: otpCooldownKey },
      select: { expiresAt: true }
    })

    if (record && record.expiresAt > new Date()) {
      const remainingMs = record.expiresAt.getTime() - Date.now()
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
      return { success: true, remainingSeconds }
    }

    return { success: true, remainingSeconds: 0 }
  } catch (error) {
    console.error("[Auth] Get OTP cooldown error:", error)
    return { success: false, error: "Failed to get OTP cooldown status", remainingSeconds: 0 }
  }
}

export async function resendOtpAction(email: string) {
  try {
    const emailClean = email.trim().toLowerCase()
    const supabase = await createClient()

    // 1. Check progressive lockout for sending OTP
    const sendLockoutKey = `otp:send_lockout:${emailClean}`
    const sendLockout = await checkLockout(sendLockoutKey)
    if (sendLockout.active) {
      const elapsedMs = sendLockout.remainingMs
      const hours = Math.floor(elapsedMs / 3600000)
      const minutes = Math.floor((elapsedMs % 3600000) / 60000)
      const seconds = Math.ceil((elapsedMs % 60000) / 1000)

      let timeString = ""
      if (hours > 0) {
        timeString = `${hours} hour(s) and ${minutes} minute(s)`
      } else if (minutes > 0) {
        timeString = `${minutes} minute(s) and ${seconds} second(s)`
      } else {
        timeString = `${seconds} second(s)`
      }

      return {
        success: false,
        error: `Too many verification requests. Please try again in ${timeString}.`
      }
    }

    // Pre-check if send attempts limit is already reached to trigger lockout immediately
    // without creating a 60s cooldown key in Redis/DB
    const isLimitReached = await isOtpSendLimitReached(emailClean)
    if (isLimitReached) {
      const incrementResult = await incrementOtpSendAttempts(emailClean)
      if (incrementResult.locked) {
        const cooldownSec = incrementResult.cooldownMs / 1000
        const cooldownStr = cooldownSec >= 3600 ? "1 hour" : `${cooldownSec / 60} minutes`
        return {
          success: false,
          error: `Too many verification requests. Send limit reached. Please try again in ${cooldownStr}.`,
          code: "lockout"
        }
      }
    }

    // 3. Check local database 60s cooldown for sending OTP
    const otpCooldownKey = `otp:send:${emailClean}`
    const otpRateLimit = await isRateLimited(otpCooldownKey, 1, 60000)
    if (!otpRateLimit.success) {
      // Re-grant access window on check
      await setOtpAccess(emailClean, 300000)
      const remainingMs = otpRateLimit.resetTime ? (otpRateLimit.resetTime.getTime() - Date.now()) : 60000
      const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000))
      return { success: true, otpAlreadySent: true, remainingSeconds }
    }

    // 2. Increment send attempts (only if we're actually allowed to send a new OTP)
    const incrementResult = await incrementOtpSendAttempts(emailClean)
    if (incrementResult.locked) {
      const cooldownSec = incrementResult.cooldownMs / 1000
      const cooldownStr = cooldownSec >= 3600 ? "1 hour" : `${cooldownSec / 60} minutes`
      return {
        success: false,
        error: `Too many verification requests. Send limit reached. Please try again in ${cooldownStr}.`,
        code: "lockout"
      }
    }

    // 4. Trigger OTP delivery
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailClean,
    })

    if (otpError) {
      if (otpError.message.includes("For security purposes")) {
        await setActiveOtp(emailClean, 300000)
        await setOtpAccess(emailClean, 300000)
        return { success: true, otpAlreadySent: true, remainingSeconds: 60 }
      }
      return { success: false, error: otpError.message }
    }

    // Refresh active OTP state and grant access in Redis
    await setActiveOtp(emailClean, 300000) // Reset active OTP valid for 5 minutes
    await setOtpAccess(emailClean, 300000) // Reset verification page access for 5 minutes

    console.info(`[Auth] OTP successfully resent to email: ${maskEmail(emailClean)}`)
    return { success: true }
  } catch (error) {
    console.error("[Auth] Resend OTP error details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred while resending the OTP."
    }
  }
}

export async function getHeroVideoUrlsAction() {
  const desktopUrl = await getSystemSetting("hero_video_url", "/videos/enhance_ocean_hill_villas.mp4")
  const mobileUrl = await getSystemSetting("hero_video_url_mobile", "/videos/enhance_ocean_hill_villas_mobile.mp4")
  return { desktopUrl, mobileUrl }
}

export async function getSystemSettingsAction() {
  try {
    const heroSubtitle = await getSystemSetting("hero_subtitle", "The Apex of Oceanfront Luxury")
    const heroTitleLine1 = await getSystemSetting("hero_title_line_1", "Where Sky Meets")
    const heroTitleLine2 = await getSystemSetting("hero_title_line_2", "Sanctuary")
    let heroDescription = await getSystemSetting("hero_description", "Nestled along the pristine sands of the coastline, our luxury resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.")
    if (heroDescription) {
      heroDescription = heroDescription
        .replace(/oceanhilling\s*resort/gi, "our luxury resort")
        .replace(/ocean\s*hill\s*(resort|villas?)/gi, "our luxury resort")
        .replace(/ocean\s*hill/gi, "our resort")
    }

    const themeColorPrimary = await getSystemSetting("theme_color_primary", "#D4AF37")
    const themeColorSecondary = await getSystemSetting("theme_color_secondary", "#FFFFFF")
    const themeColorAccent = await getSystemSetting("theme_color_accent", "#1C1A17")

    const heroVideoUrl = await getSystemSetting("hero_video_url", "/videos/enhance_ocean_hill_villas.mp4")
    const heroVideoUrlMobile = await getSystemSetting("hero_video_url_mobile", "/videos/enhance_ocean_hill_villas_mobile.mp4")

    const brandName = await getSystemSetting("brand_name", "MIGS THE SHORE")
    const brandLogo = await getSystemSetting("brand_logo", "")

    const socialFacebook = await getSystemSetting("social_facebook", "https://facebook.com")
    const socialInstagram = await getSystemSetting("social_instagram", "https://instagram.com")
    const socialTiktok = await getSystemSetting("social_tiktok", "https://tiktok.com")
    const socialTwitter = await getSystemSetting("social_twitter", "https://twitter.com")

    const resortLatitude = await getSystemSetting("resort_latitude", "16.1651539")
    const resortLongitude = await getSystemSetting("resort_longitude", "119.7698115")
    const resortLocationTitleLine1 = await getSystemSetting("resort_location_title_line_1", "Poised Above the")
    const resortLocationTitleLine2 = await getSystemSetting("resort_location_title_line_2", "Aegean Horizon")
    const resortLocationDescription = await getSystemSetting(
      "resort_location_description",
      "Accessible directly via scenic coastal highways, private yacht tenders, or our beachside boardwalk. Our resort occupies a prime oceanfront location offering unrivaled panoramic views while staying secluded in a private sandy cove."
    )
    const resortRegion = await getSystemSetting("resort_region", "Pangasinan")

    const touristSpots = await getSystemSetting(
      "tourist_spots",
      JSON.stringify([
        { name: "Abagatanen White Beach", distance: "1 min Walk" },
        { name: "Agno Umbrella Rocks", distance: "8 mins Shore Drive" },
        { name: "Bani Olanen Beach", distance: "12 mins Drive" },
        { name: "Hundred Islands (Alaminos)", distance: "35 mins Resort Shuttle" },
        { name: "Cape Bolinao Lighthouse", distance: "45 mins Private Charter" }
      ])
    )

    const resortAmenities = await getSystemSetting(
      "resort_amenities",
      JSON.stringify([
        {
          id: "beach-club",
          title: "Private Beach Club",
          subtitle: "Pristine Sands & Daybeds",
          description: "Enjoy exclusive access to our secluded white sand cove, fully serviced with luxury loungers, double daybeds, and dedicated beachside concierges.",
          category: "beach",
          categoryLabel: "Beachfront",
          icon: "fa-umbrella-beach",
          hours: "6:00 AM – 7:00 PM",
          perks: ["Private Cove", "Double Daybeds", "Butler Service"],
          highlightBadge: "Signature",
        },
        {
          id: "water-sports",
          title: "Water Sports & Charters",
          subtitle: "Coastal Exploration",
          description: "Paddleboards, sea kayaks, and custom luxury yacht charters are available directly from the private resort pier for bespoke ocean exploration.",
          category: "beach",
          categoryLabel: "Sea Adventures",
          icon: "fa-ship",
          hours: "8:00 AM – 5:00 PM",
          perks: ["Private Yachts", "Sea Kayaks", "Guided Reef Tours"],
        },
        {
          id: "fine-dining",
          title: "Fine Oceanfront Dining",
          subtitle: "Mediterranean Gastronomy",
          description: "Indulge in gourmet Mediterranean cuisine crafted from locally sourced coastal ingredients, served directly over the water under the evening stars.",
          category: "dining",
          categoryLabel: "Gourmet Dining",
          icon: "fa-utensils",
          hours: "11:30 AM – 11:00 PM",
          perks: ["Michelin-Caliber Chefs", "Overwater Deck", "Private Cellar"],
          highlightBadge: "Award Winning",
        },
        {
          id: "poolside-loungers",
          title: "Poolside Loungers & Cabanas",
          subtitle: "Lagoon & Infinity Terraces",
          description: "Relax beside our multi-tiered heated lagoon and infinity pools, featuring shaded luxury cabanas, chilled towel service, and panoramic ocean vistas.",
          category: "wellness",
          categoryLabel: "Relaxation",
          icon: "fa-water",
          hours: "7:00 AM – 10:00 PM",
          perks: ["Infinity Edge", "Heated Waters", "Chilled Towels"],
        },
        {
          id: "wellness-spa",
          title: "Wellness & Spa Pavilion",
          subtitle: "Holistic Rejuvenation",
          description: "Experience world-class massage therapy, Himalayan salt saunas, and sensory wellness treatments designed to restore body and mind right on the shore.",
          category: "wellness",
          categoryLabel: "Holistic Health",
          icon: "fa-spa",
          hours: "9:00 AM – 9:00 PM",
          perks: ["Herbal Steam", "Deep Tissue Massage", "Sound Healing"],
          highlightBadge: "Holistic",
        },
        {
          id: "sunset-bar",
          title: "Sunset Cabana Bar",
          subtitle: "Artisanal Libations",
          description: "Sip custom botanical cocktails, fresh cold-pressed tropical juices, and vintage reserve wines served directly to your lounge chair by master mixologists.",
          category: "dining",
          categoryLabel: "Seaside Drinks",
          icon: "fa-martini-glass-citrus",
          hours: "3:00 PM – Midnight",
          perks: ["Master Mixology", "Craft Botanical Cocktails", "Sunset DJ Sets"],
        },
      ])
    )

    return {
      heroSubtitle,
      heroTitleLine1,
      heroTitleLine2,
      heroDescription,
      themeColorPrimary,
      themeColorSecondary,
      themeColorAccent,
      theme_color_primary: themeColorPrimary,
      theme_color_secondary: themeColorSecondary,
      theme_color_accent: themeColorAccent,
      heroVideoUrl,
      heroVideoUrlMobile,
      brandName,
      brandLogo,
      socialFacebook,
      socialInstagram,
      socialTiktok,
      socialTwitter,
      touristSpots,
      resortLatitude,
      resortLongitude,
      resortLocationTitleLine1,
      resortLocationTitleLine2,
      resortLocationDescription,
      resortRegion,
      resort_latitude: resortLatitude,
      resort_longitude: resortLongitude,
      resortAmenities,
      resort_amenities: resortAmenities,
    }
  } catch (error) {
    console.error("[SettingsAction] Failed to retrieve system settings:", error)
    return {
      heroSubtitle: "The Apex of Oceanfront Luxury",
      heroTitleLine1: "Where Sky Meets",
      heroTitleLine2: "Sanctuary",
      heroDescription: "Nestled along the pristine sands of the coastline, our luxury resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.",
      themeColorPrimary: "#D4AF37",
      themeColorSecondary: "#FFFFFF",
      themeColorAccent: "#1C1A17",
      theme_color_primary: "#D4AF37",
      theme_color_secondary: "#FFFFFF",
      theme_color_accent: "#1C1A17",
      heroVideoUrl: "/videos/enhance_ocean_hill_villas.mp4",
      heroVideoUrlMobile: "/videos/enhance_ocean_hill_villas_mobile.mp4",
      brandName: "MIGS THE SHORE",
      brandLogo: "",
      socialFacebook: "https://facebook.com",
      socialInstagram: "https://instagram.com",
      socialTiktok: "https://tiktok.com",
      socialTwitter: "https://twitter.com",
      touristSpots: JSON.stringify([
        { name: "Abagatanen White Beach", distance: "1 min Walk" },
        { name: "Agno Umbrella Rocks", distance: "8 mins Shore Drive" },
        { name: "Bani Olanen Beach", distance: "12 mins Drive" },
        { name: "Hundred Islands (Alaminos)", distance: "35 mins Resort Shuttle" },
        { name: "Cape Bolinao Lighthouse", distance: "45 mins Private Charter" }
      ]),
      resortLatitude: "16.1651539",
      resortLongitude: "119.7698115",
      resortLocationTitleLine1: "Poised Above the",
      resortLocationTitleLine2: "Aegean Horizon",
      resortLocationDescription: "Accessible directly via scenic coastal highways, private yacht tenders, or our beachside boardwalk. Our resort occupies a prime oceanfront location offering unrivaled panoramic views while staying secluded in a private sandy cove.",
      resortRegion: "Pangasinan",
      resort_latitude: "16.1651539",
      resort_longitude: "119.7698115",
      resortAmenities: JSON.stringify([
        {
          id: "beach-club",
          title: "Private Beach Club",
          subtitle: "Pristine Sands & Daybeds",
          description: "Enjoy exclusive access to our secluded white sand cove, fully serviced with luxury loungers, double daybeds, and dedicated beachside concierges.",
          category: "beach",
          categoryLabel: "Beachfront",
          icon: "fa-umbrella-beach",
          hours: "6:00 AM – 7:00 PM",
          perks: ["Private Cove", "Double Daybeds", "Butler Service"],
          highlightBadge: "Signature",
        },
        {
          id: "water-sports",
          title: "Water Sports & Charters",
          subtitle: "Coastal Exploration",
          description: "Paddleboards, sea kayaks, and custom luxury yacht charters are available directly from the private resort pier for bespoke ocean exploration.",
          category: "beach",
          categoryLabel: "Sea Adventures",
          icon: "fa-ship",
          hours: "8:00 AM – 5:00 PM",
          perks: ["Private Yachts", "Sea Kayaks", "Guided Reef Tours"],
        },
        {
          id: "fine-dining",
          title: "Fine Oceanfront Dining",
          subtitle: "Mediterranean Gastronomy",
          description: "Indulge in gourmet Mediterranean cuisine crafted from locally sourced coastal ingredients, served directly over the water under the evening stars.",
          category: "dining",
          categoryLabel: "Gourmet Dining",
          icon: "fa-utensils",
          hours: "11:30 AM – 11:00 PM",
          perks: ["Michelin-Caliber Chefs", "Overwater Deck", "Private Cellar"],
          highlightBadge: "Award Winning",
        },
        {
          id: "poolside-loungers",
          title: "Poolside Loungers & Cabanas",
          subtitle: "Lagoon & Infinity Terraces",
          description: "Relax beside our multi-tiered heated lagoon and infinity pools, featuring shaded luxury cabanas, chilled towel service, and panoramic ocean vistas.",
          category: "wellness",
          categoryLabel: "Relaxation",
          icon: "fa-water",
          hours: "7:00 AM – 10:00 PM",
          perks: ["Infinity Edge", "Heated Waters", "Chilled Towels"],
        },
        {
          id: "wellness-spa",
          title: "Wellness & Spa Pavilion",
          subtitle: "Holistic Rejuvenation",
          description: "Experience world-class massage therapy, Himalayan salt saunas, and sensory wellness treatments designed to restore body and mind right on the shore.",
          category: "wellness",
          categoryLabel: "Holistic Health",
          icon: "fa-spa",
          hours: "9:00 AM – 9:00 PM",
          perks: ["Herbal Steam", "Deep Tissue Massage", "Sound Healing"],
          highlightBadge: "Holistic",
        },
        {
          id: "sunset-bar",
          title: "Sunset Cabana Bar",
          subtitle: "Artisanal Libations",
          description: "Sip custom botanical cocktails, fresh cold-pressed tropical juices, and vintage reserve wines served directly to your lounge chair by master mixologists.",
          category: "dining",
          categoryLabel: "Seaside Drinks",
          icon: "fa-martini-glass-citrus",
          hours: "3:00 PM – Midnight",
          perks: ["Master Mixology", "Craft Botanical Cocktails", "Sunset DJ Sets"],
        },
      ]),
      resort_amenities: "",
    }
  }
}

export async function updateSystemSettingsAction(settings: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(settings)) {
      await setSystemSetting(key, value)
    }
    revalidatePath("/", "layout")
    revalidatePath("/admin/system")
    revalidatePath("/admin/settings")
    revalidatePath("/admin/location")
    revalidatePath("/admin/amenities")
    return { success: true }
  } catch (error) {
    console.error("[SettingsAction] Failed to update system settings:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js"

export async function uploadBrandLogoAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const supabase = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileExt = file.name.split(".").pop();
    const fileName = `brand_logo_${Date.now()}.${fileExt}`;
    const filePath = `branding/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from("system-settings")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("system-settings")
      .getPublicUrl(filePath);

    return { success: true, publicUrl };
  } catch (error) {
    console.error("[UploadAction] Failed to upload logo via service role:", error);
    return { success: false, error: error instanceof Error ? error.message : "Upload failed" };
  }
}

export async function getOtpStatusAction(email: string) {
  try {
    const status = await getOtpStatus(email)
    return { success: true, status }
  } catch (error) {
    console.error("[Auth] getOtpStatusAction failed:", error)
    return { success: false, error: "Failed to fetch OTP status." }
  }
}

export async function getPrimaryThemeColorAction() {
  try {
    const themeColorPrimary = await getSystemSetting("theme_color_primary", "#D4AF37")
    return { themeColorPrimary }
  } catch (error) {
    console.error("[SettingsAction] Failed to retrieve primary theme color:", error)
    return { themeColorPrimary: "#D4AF37" }
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function forgotPasswordAction(email: string) {
  try {
    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const emailClean = email.trim().toLowerCase()
    const supabase = await createClient()

    // 1. Check if user exists in database (respecting SELECT restrictions)
    const existingUser = await prisma.user.findUnique({
      where: { email: emailClean },
      select: { id: true, email: true }
    })

    if (!existingUser) {
      return {
        success: false,
        error: "No account found registered with this email address."
      }
    }

    // 2. Check progressive lockout for sending OTP
    const sendLockoutKey = `otp:send_lockout:${emailClean}`
    const sendLockout = await checkLockout(sendLockoutKey)
    if (sendLockout.active) {
      const elapsedMs = sendLockout.remainingMs
      const hours = Math.floor(elapsedMs / 3600000)
      const minutes = Math.floor((elapsedMs % 3600000) / 60000)
      const seconds = Math.ceil((elapsedMs % 60000) / 1000)

      let timeString = ""
      if (hours > 0) {
        timeString = `${hours} hour(s) and ${minutes} minute(s)`
      } else if (minutes > 0) {
        timeString = `${minutes} minute(s) and ${seconds} second(s)`
      } else {
        timeString = `${seconds} second(s)`
      }

      return {
        success: false,
        error: `Too many verification requests. Please try again in ${timeString}.`
      }
    }

    // Pre-check if send attempts limit is already reached
    const isLimitReached = await isOtpSendLimitReached(emailClean)
    if (isLimitReached) {
      const incrementResult = await incrementOtpSendAttempts(emailClean)
      if (incrementResult.locked) {
        const cooldownSec = incrementResult.cooldownMs / 1000
        const cooldownStr = cooldownSec >= 3600 ? "1 hour" : `${cooldownSec / 60} minutes`
        return {
          success: false,
          error: `Too many verification requests. Send limit reached. Please try again in ${cooldownStr}.`
        }
      }
    }

    // 3. Check 60s cooldown for sending OTP
    const otpCooldownKey = `otp:send:${emailClean}`
    const otpRateLimit = await isRateLimited(otpCooldownKey, 1, 60000)
    if (!otpRateLimit.success) {
      await setOtpAccess(emailClean, 300000)
      return { success: true, otpAlreadySent: true }
    }

    // Increment send attempts
    const incrementResult = await incrementOtpSendAttempts(emailClean)
    if (incrementResult.locked) {
      const cooldownSec = incrementResult.cooldownMs / 1000
      const cooldownStr = cooldownSec >= 3600 ? "1 hour" : `${cooldownSec / 60} minutes`
      return {
        success: false,
        error: `Too many verification requests. Send limit reached. Please try again in ${cooldownStr}.`
      }
    }

    // 4. Send 8-digit OTP code to email
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailClean,
    })

    if (otpError) {
      if (otpError.message.includes("For security purposes")) {
        await setActiveOtp(emailClean, 300000)
        await setOtpAccess(emailClean, 300000)
        return { success: true, otpAlreadySent: true }
      }
      return { success: false, error: otpError.message }
    }

    // Save active OTP state and grant access in Redis
    await setActiveOtp(emailClean, 300000)
    await setOtpAccess(emailClean, 300000)

    console.info(`[Auth] Password reset OTP requested for email: ${maskEmail(emailClean)}`)
    return { success: true }
  } catch (error) {
    console.error("[Auth] forgotPasswordAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate password reset."
    }
  }
}

const resetPasswordFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().min(6, "Verification code must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function resetPasswordAction(formData: z.infer<typeof resetPasswordFormSchema>) {
  try {
    const parsed = resetPasswordFormSchema.safeParse(formData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const { email, code, newPassword } = parsed.data
    const emailClean = email.trim().toLowerCase()
    const supabase = await createClient()

    // 1. Check lockout status
    const lockoutKey = `otp:lockout:${emailClean}`
    const otpLockout = await checkLockout(lockoutKey)
    if (otpLockout.active) {
      const elapsedMs = otpLockout.remainingMs
      const minutes = Math.floor(elapsedMs / 60000)
      const seconds = Math.ceil((elapsedMs % 60000) / 1000)
      const timeString = minutes > 0 ? `${minutes} minute(s) and ${seconds} second(s)` : `${seconds} second(s)`
      return {
        success: false,
        error: `Too many incorrect OTP codes. Verification is locked for ${timeString}.`,
        code: "lockout"
      }
    }

    // 2. Verify OTP code (try email type first for 8-digit OTP, fallback to recovery type)
    let { data, error } = await supabase.auth.verifyOtp({
      email: emailClean,
      token: code.trim(),
      type: "email"
    })

    if (error) {
      const retry = await supabase.auth.verifyOtp({
        email: emailClean,
        token: code.trim(),
        type: "recovery"
      })
      if (!retry.error) {
        data = retry.data
        error = null
      }
    }

    if (error) {
      // Track failed attempts (Max 3 failed OTP entries per 3 minutes)
      const failKey = `otp:fail:${emailClean}`
      const limitCheck = await isRateLimited(failKey, 3, 180000)
      if (!limitCheck.success || limitCheck.remaining === 0) {
        await prisma.rateLimit.upsert({
          where: { key: lockoutKey },
          create: { key: lockoutKey, attempts: 1, expiresAt: new Date(Date.now() + 180000) },
          update: { attempts: 1, expiresAt: new Date(Date.now() + 180000) }
        })
        return {
          success: false,
          error: "Too many incorrect OTP codes. Verification is locked for 3 minutes.",
          code: "lockout"
        }
      }
      return {
        success: false,
        error: `Incorrect verification code. You have ${limitCheck.remaining} attempt${limitCheck.remaining > 1 ? "s" : ""} left.`
      }
    }

    // 3. User verified! Update the password
    const user = data?.user
    if (!user) {
      return {
        success: false,
        error: "User identity verification failed. Please try again."
      }
    }

    // Update password using Supabase Service Client for guaranteed synchronization
    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await serviceClient.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
        email_confirm: true,
      }
    )

    if (updateError) {
      console.error("[Auth] Failed to update password in Supabase:", updateError.message)
      return { success: false, error: updateError.message }
    }

    // Sign out any active session so the user signs in cleanly with the new password
    await supabase.auth.signOut()

    // Clear all rate limits upon successful password reset
    await clearAllRateLimits(emailClean)

    console.info(`[Auth] Password successfully reset for user: ${maskEmail(emailClean)}`)
    return { success: true }
  } catch (error) {
    console.error("[Auth] resetPasswordAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred while resetting the password."
    }
  }
}

export async function updatePasswordWithSessionAction(newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." }
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Recovery session expired or invalid. Please request a new reset link." }
    }

    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await serviceClient.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
        email_confirm: true,
      }
    )

    if (updateError) {
      console.error("[Auth] updatePasswordWithSessionAction update error:", updateError.message)
      return { success: false, error: updateError.message }
    }

    await supabase.auth.signOut()

    if (user.email) {
      await clearAllRateLimits(user.email)
    }

    return { success: true }
  } catch (error) {
    console.error("[Auth] updatePasswordWithSessionAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update password."
    }
  }
}

export async function getCurrentUserRoleAction() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return { isLoggedIn: false, role: null }
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          ...(user.email ? [{ email: user.email.toLowerCase() }] : [])
        ]
      },
      select: { role: true }
    })

    return {
      isLoggedIn: true,
      role: dbUser?.role || "GUEST"
    }
  } catch (error) {
    console.error("[Auth] getCurrentUserRoleAction error:", error)
    return { isLoggedIn: false, role: null }
  }
}
