import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, redirect there, otherwise redirect home
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the authenticated user details
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email

      if (email) {
        // Import prisma client singleton
        const { default: prisma } = await import("@/lib/prisma/client")
        const exists = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() }
        })

        if (!exists) {
          // Force sign out to clear session
          await supabase.auth.signOut()
          const errorMsg = "Account not found. Please register an account before signing in."
          return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorMsg)}`)
        }

        // Force sign out of the active OAuth session to enforce OTP
        await supabase.auth.signOut()

        // Trigger OTP delivery
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
        })

        if (otpError) {
          return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(otpError.message)}`)
        }

        // Redirect to OTP verify page
        return NextResponse.redirect(`${origin}/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`)
}
