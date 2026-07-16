import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isRateLimited, incrementOtpSendAttempts, maskEmail, checkLockout, setActiveOtp, setOtpAccess, isOtpSendLimitReached } from "@/lib/rate-limit"
import prisma from "@/lib/prisma/client"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const isSignup = searchParams.get("signup") === "true"
  // if "next" is in param, redirect there, otherwise redirect home
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the authenticated user details
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email
      if (email) {
        const emailClean = email.trim().toLowerCase()
        
        const exists = await prisma.user.findUnique({
          where: { email: emailClean }
        })
        
        const isSignupActive = isSignup || !exists

        const otpLockoutKey = `otp:lockout:${emailClean}`
        const otpLockout = await checkLockout(otpLockoutKey)
        if (otpLockout.active) {
          await supabase.auth.signOut()
          const elapsedMs = otpLockout.remainingMs
          const minutes = Math.floor(elapsedMs / 60000)
          const seconds = Math.ceil((elapsedMs % 60000) / 1000)
          const timeString = minutes > 0 ? `${minutes} minute(s) and ${seconds} second(s)` : `${seconds} second(s)`
          const errorMsg = `Too many incorrect verification attempts. Please try again in ${timeString}.`
          const targetUrl = isSignupActive ? `${origin}/auth/signup` : `${origin}/auth/login`
          return NextResponse.redirect(`${targetUrl}?error=${encodeURIComponent(errorMsg)}`)
        }

        // Force sign out of the active OAuth session to enforce OTP
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

          const errorMsg = `Too many verification requests. Please try again in ${timeString}.`
          const targetUrl = isSignupActive ? `${origin}/auth/signup` : `${origin}/auth/login`
          return NextResponse.redirect(`${targetUrl}?error=${encodeURIComponent(errorMsg)}`)
        }

        const verifyUrl = isSignupActive
          ? `${origin}/auth/verify?email=${encodeURIComponent(emailClean)}&signup=true`
          : `${origin}/auth/verify?email=${encodeURIComponent(emailClean)}`

        // Pre-check if send attempts limit is already reached to trigger lockout immediately
        // without creating a 60s cooldown key in Redis/DB
        const isLimitReached = await isOtpSendLimitReached(emailClean)
        if (isLimitReached) {
          const incrementResult = await incrementOtpSendAttempts(emailClean)
          if (incrementResult.locked) {
            const cooldownSec = incrementResult.cooldownMs / 1000
            const cooldownStr = cooldownSec >= 3600 ? "1 hour" : `${cooldownSec / 60} minutes`
            const errorMsg = `Too many verification requests. Send limit reached. Please try again in ${cooldownStr}.`
            const targetUrl = isSignupActive ? `${origin}/auth/signup` : `${origin}/auth/login`
            return NextResponse.redirect(`${targetUrl}?error=${encodeURIComponent(errorMsg)}`)
          }
        }

        // Check local database cooldown for sending OTP
        const otpRateLimit = await isRateLimited(`otp:send:${emailClean}`, 1, 60000)
        if (!otpRateLimit.success) {
          // Redirect to OTP verify page directly since one is already active
          await setOtpAccess(emailClean, 300000)
          return NextResponse.redirect(verifyUrl)
        }

        // Increment send attempts (only if we're actually allowed to send a new OTP)
        const incrementResult = await incrementOtpSendAttempts(emailClean)
        if (incrementResult.locked) {
          const cooldownSec = incrementResult.cooldownMs / 1000
          const cooldownStr = cooldownSec >= 3600 ? "1 hour" : `${cooldownSec / 60} minutes`
          const errorMsg = `Too many verification requests. Send limit reached. Please try again in ${cooldownStr}.`
          const targetUrl = isSignupActive ? `${origin}/auth/signup` : `${origin}/auth/login`
          return NextResponse.redirect(`${targetUrl}?error=${encodeURIComponent(errorMsg)}`)
        }

        // Trigger OTP delivery
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: emailClean,
        })

        if (otpError) {
          if (otpError.message.includes("For security purposes")) {
            await setActiveOtp(emailClean, 300000)
            await setOtpAccess(emailClean, 300000)
            return NextResponse.redirect(verifyUrl)
          }
          return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(otpError.message)}`)
        }

        console.info(`[Auth] OAuth-callback OTP successfully requested for email: ${maskEmail(emailClean)}`)
        await setActiveOtp(emailClean, 300000)
        await setOtpAccess(emailClean, 300000)
        return NextResponse.redirect(verifyUrl)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`)
}
