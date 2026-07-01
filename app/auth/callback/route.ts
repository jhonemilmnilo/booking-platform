import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isRateLimited } from "@/lib/rate-limit"
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
        const otpLockoutKey = `otp:lockout:${emailClean}`
        const existingOtpLockout = await prisma.rateLimit.findUnique({
          where: { key: otpLockoutKey }
        })
        const now = new Date()
        if (existingOtpLockout && existingOtpLockout.expiresAt > now) {
          await supabase.auth.signOut()
          const elapsedMs = existingOtpLockout.expiresAt.getTime() - now.getTime()
          const minutes = Math.floor(elapsedMs / 60000)
          const seconds = Math.ceil((elapsedMs % 60000) / 1000)
          const timeString = minutes > 0 ? `${minutes} minute(s) and ${seconds} second(s)` : `${seconds} second(s)`
          const errorMsg = `Too many incorrect verification attempts. Please try again in ${timeString}.`
          return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorMsg)}`)
        }

        const exists = await prisma.user.findUnique({
          where: { email: emailClean }
        })

        if (!exists && !isSignup) {
          // Force sign out to clear session
          await supabase.auth.signOut()
          const errorMsg = "Account not found. Please register an account before signing in."
          return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorMsg)}`)
        }

        // Force sign out of the active OAuth session to enforce OTP
        await supabase.auth.signOut()

        const verifyUrl = isSignup
          ? `${origin}/auth/verify?email=${encodeURIComponent(emailClean)}&signup=true`
          : `${origin}/auth/verify?email=${encodeURIComponent(emailClean)}`

        // Check local database cooldown for sending OTP
        const otpRateLimit = await isRateLimited(`otp:send:${emailClean}`, 1, 60000)
        if (!otpRateLimit.success) {
          // Redirect to OTP verify page directly since one is already active
          return NextResponse.redirect(verifyUrl)
        }

        // Trigger OTP delivery
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: emailClean,
        })

        if (otpError) {
          if (otpError.message.includes("For security purposes")) {
            return NextResponse.redirect(verifyUrl)
          }
          return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(otpError.message)}`)
        }

        return NextResponse.redirect(verifyUrl)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`)
}
