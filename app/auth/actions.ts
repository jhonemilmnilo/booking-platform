"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import prisma from "@/lib/prisma/client"
import { isRateLimited } from "@/lib/rate-limit"

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

  // Sign out to enforce OTP verification on next screen
  await supabase.auth.signOut()

  // 3. Send Login OTP
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
  })

  if (otpError) {
    return { success: false, error: otpError.message }
  }

  return { success: true, otpRequired: true }
}

export async function signUpWithEmailAction(formData: z.infer<typeof signUpSchema>) {
  const parsed = signUpSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { email, password, fullName } = parsed.data
  const supabase = await createClient()

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
    return { success: false, error: error.message }
  }

  return { success: true, user: data.user }
}

export async function verifyOtpAction(email: string, code: string) {
  const emailClean = email.trim().toLowerCase()
  const supabase = await createClient()

  // 1. Check lockout status
  const lockoutKey = `otp:lockout:${emailClean}`
  const existingLockout = await prisma.rateLimit.findUnique({
    where: { key: lockoutKey }
  })
  const now = new Date()
  if (existingLockout && existingLockout.expiresAt > now) {
    const minutesLeft = Math.ceil((existingLockout.expiresAt.getTime() - now.getTime()) / 60000)
    return {
      success: false,
      error: `Too many failed attempts! OTP verification is locked for ${minutesLeft} minute(s).`,
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

  // Success! Clear fail trackers
  await prisma.rateLimit.deleteMany({
    where: { key: { in: [`otp:fail:${emailClean}`, lockoutKey] } }
  })

  // 2. Profile Syncing: Ensure profile exists in public.User table
  const user = data.user
  if (user) {
    const exists = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!exists) {
      // Create user record in our public table if it doesn't exist
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          fullName: user.user_metadata["full_name"] || "New Guest",
          role: "GUEST"
        }
      })
    }
  }

  return { success: true }
}

export async function getSocialLoginUrlAction(provider: "google" | "facebook", origin: string) {
  const supabase = await createClient()
  const redirectTo = `${origin}/auth/callback`

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
