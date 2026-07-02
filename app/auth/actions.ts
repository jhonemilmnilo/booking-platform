"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import prisma from "@/lib/prisma/client"
import { isRateLimited, incrementOtpSendAttempts, resetOtpSendLimits, maskEmail, checkLockout } from "@/lib/rate-limit"
import { getSystemSetting, setSystemSetting } from "@/lib/settings"

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

  // Clear active session to enforce OTP
  await supabase.auth.signOut()

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

  // 3. Check local database cooldown for sending OTP to avoid hitting Supabase rate limit
  const otpCooldownKey = `otp:send:${emailClean}`
  const otpRateLimit = await isRateLimited(otpCooldownKey, 1, 60000)
  if (!otpRateLimit.success) {
    return { success: true, otpRequired: true, otpAlreadySent: true }
  }

  // 4. Send Login OTP
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
  })

  if (otpError) {
    if (otpError.message.includes("For security purposes")) {
      return { success: true, otpRequired: true, otpAlreadySent: true }
    }
    return { success: false, error: otpError.message }
  }

  console.info(`[Auth] Login OTP successfully requested for email: ${maskEmail(emailClean)}`)
  return { success: true, otpRequired: true }
}

export async function signUpWithEmailAction(formData: z.infer<typeof signUpSchema>) {
  const parsed = signUpSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, password, fullName } = parsed.data
  const emailClean = email.trim().toLowerCase()
  const supabase = await createClient()

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
      return { success: true, user: data?.user, otpAlreadySent: true }
    }
    return { success: false, error: error.message }
  }

  console.info(`[Auth] Signup OTP successfully requested for email: ${maskEmail(emailClean)}`)
  return { success: true, user: data.user }
}

export async function verifyOtpAction(email: string, code: string) {
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

  // Success! Clear fail trackers and reset progressive OTP send limits
  await resetOtpSendLimits(emailClean)
  await prisma.rateLimit.deleteMany({
    where: { key: { in: [`otp:fail:${emailClean}`, lockoutKey] } }
  })

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

export async function resendOtpAction(email: string) {
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

  // 2. Increment send attempts
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

  // 3. Check local database 60s cooldown for sending OTP
  const otpCooldownKey = `otp:send:${emailClean}`
  const otpRateLimit = await isRateLimited(otpCooldownKey, 1, 60000)
  if (!otpRateLimit.success) {
    return { success: true, otpAlreadySent: true }
  }

  // 4. Trigger OTP delivery
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: emailClean,
  })

  if (otpError) {
    if (otpError.message.includes("For security purposes")) {
      return { success: true, otpAlreadySent: true }
    }
    return { success: false, error: otpError.message }
  }

  console.info(`[Auth] OTP successfully resent to email: ${maskEmail(emailClean)}`)
  return { success: true }
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
    const heroDescription = await getSystemSetting("hero_description", "Nestled along the pristine sands of the Aegean coastline, Ocean Hill Resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.")
    
    const themeColorPrimary = await getSystemSetting("theme_color_primary", "#D4AF37")
    const themeColorSecondary = await getSystemSetting("theme_color_secondary", "#FFFFFF")
    const themeColorAccent = await getSystemSetting("theme_color_accent", "#1C1A17")

    const heroVideoUrl = await getSystemSetting("hero_video_url", "/videos/enhance_ocean_hill_villas.mp4")
    const heroVideoUrlMobile = await getSystemSetting("hero_video_url_mobile", "/videos/enhance_ocean_hill_villas_mobile.mp4")

    const brandName = await getSystemSetting("brand_name", "Ocean Hill")
    const brandLogo = await getSystemSetting("brand_logo", "")

    const socialFacebook = await getSystemSetting("social_facebook", "https://facebook.com")
    const socialInstagram = await getSystemSetting("social_instagram", "https://instagram.com")
    const socialTiktok = await getSystemSetting("social_tiktok", "https://tiktok.com")
    const socialTwitter = await getSystemSetting("social_twitter", "https://twitter.com")

    return {
      heroSubtitle,
      heroTitleLine1,
      heroTitleLine2,
      heroDescription,
      themeColorPrimary,
      themeColorSecondary,
      themeColorAccent,
      heroVideoUrl,
      heroVideoUrlMobile,
      brandName,
      brandLogo,
      socialFacebook,
      socialInstagram,
      socialTiktok,
      socialTwitter,
    }
  } catch (error) {
    console.error("[SettingsAction] Failed to retrieve system settings:", error)
    return {
      heroSubtitle: "The Apex of Oceanfront Luxury",
      heroTitleLine1: "Where Sky Meets",
      heroTitleLine2: "Sanctuary",
      heroDescription: "Nestled along the pristine sands of the Aegean coastline, Ocean Hill Resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.",
      themeColorPrimary: "#D4AF37",
      themeColorSecondary: "#FFFFFF",
      themeColorAccent: "#1C1A17",
      heroVideoUrl: "/videos/enhance_ocean_hill_villas.mp4",
      heroVideoUrlMobile: "/videos/enhance_ocean_hill_villas_mobile.mp4",
      brandName: "Ocean Hill",
      brandLogo: "",
      socialFacebook: "https://facebook.com",
      socialInstagram: "https://instagram.com",
      socialTiktok: "https://tiktok.com",
      socialTwitter: "https://twitter.com",
    }
  }
}

export async function updateSystemSettingsAction(settings: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(settings)) {
      await setSystemSetting(key, value)
    }
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

