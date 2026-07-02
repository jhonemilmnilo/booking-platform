"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { showToast } from "@/components/shared/Toast"
import { Loader2, ShieldCheck, Mail, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyOtpAction, resendOtpAction } from "../actions"

import { Suspense } from "react"

const verifySchema = z.object({
  code: z.string().length(8, "Code must be exactly 8 digits").regex(/^\d+$/, "Code must contain only numbers"),
})

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  
  const [isPending, startTransition] = React.useTransition()
  const [resendTimer, setResendTimer] = React.useState(0)
  const [isResending, setIsResending] = React.useState(false)

  // Track unmount to allow returning to sign-in/up without redirect loops
  React.useEffect(() => {
    return () => {
      sessionStorage.setItem("otp_bypassed", "true")
    }
  }, [])

  // Track active OTP session and initialize/restore the countdown timer
  React.useEffect(() => {
    if (!email) return
    localStorage.setItem("pending_otp_email", email)
    localStorage.setItem("pending_otp_timestamp", Date.now().toString())

    const expiryKey = `otp_resend_expiry:${email}`
    const storedExpiry = localStorage.getItem(expiryKey)

    const timer = setTimeout(() => {
      if (storedExpiry) {
        const remaining = Math.ceil((parseInt(storedExpiry, 10) - Date.now()) / 1000)
        if (remaining > 0) {
          setResendTimer(remaining)
          showToast.info("Verification in Progress", "We already sent an OTP code. Please check your inbox or spam folder.")
        } else {
          setResendTimer(0)
        }
      } else {
        // Set new 60s cooldown if it's the first time landing here
        const newExpiry = Date.now() + 60000
        localStorage.setItem(expiryKey, newExpiry.toString())
        setResendTimer(60)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [email])

  // Countdown timer for Resend button
  React.useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(`otp_resend_expiry:${email}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer, email])

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  })

  const onSubmit = (values: z.infer<typeof verifySchema>) => {
    if (!email) {
      showToast.error("Missing email address. Please go back and try again.")
      return
    }

    startTransition(async () => {
      const result = await verifyOtpAction(email, values.code)
      if (result.success) {
        localStorage.removeItem("pending_otp_email")
        localStorage.removeItem("pending_otp_timestamp")
        localStorage.removeItem(`otp_resend_expiry:${email}`)
        showToast.success("Identity verified successfully!")
        if (result.role === "ADMIN") {
          router.push("/admin/settings")
        } else {
          router.push("/")
        }
        router.refresh()
      } else {
        showToast.error(result.error || "Verification failed.")
        if (result.code === "lockout") {
          localStorage.removeItem("pending_otp_email")
          localStorage.removeItem("pending_otp_timestamp")
          localStorage.removeItem(`otp_resend_expiry:${email}`)
          router.push("/auth/signup")
        }
      }
    })
  }

  const handleResendCode = async () => {
    if (!email) return
    setIsResending(true)
    const result = await resendOtpAction(email)
    setIsResending(false)

    if (result.success) {
      if (result.otpAlreadySent) {
        showToast.info("Verification code already sent", "Please check your inbox or spam folder.")
      } else {
        showToast.success("A new 8-digit code has been sent to your email.")
      }
      const expiryKey = `otp_resend_expiry:${email}`
      localStorage.setItem(expiryKey, (Date.now() + 60000).toString())
      setResendTimer(60)
    } else {
      showToast.error(result.error || "Failed to resend code.")
      if (result.code === "lockout") {
        localStorage.removeItem("pending_otp_email")
        localStorage.removeItem("pending_otp_timestamp")
        localStorage.removeItem(`otp_resend_expiry:${email}`)
        router.push("/auth/signup")
      }
    }
  }

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <Card className="w-full max-w-[420px] bg-card border-border shadow-xl rounded-2xl overflow-hidden">
        {/* Brand Header */}
        <div className="bg-primary/5 py-6 border-b border-border/40 flex flex-col items-center justify-center gap-1">
          <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
          <span className="font-bold tracking-tight text-foreground text-sm uppercase">Verification Portal</span>
        </div>

        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We sent an 8-digit verification code to
            <span className="block font-semibold text-foreground mt-1 break-all">{email || "your email"}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="8-Digit OTP Code" error={form.formState.errors.code?.message}>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...form.register("code")}
                  placeholder="12345678"
                  maxLength={8}
                  disabled={isPending}
                  className="pl-9 h-10 text-center tracking-[0.5em] font-mono text-lg"
                />
              </div>
            </FormField>

            <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground h-10 rounded-xl font-semibold">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying code...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>

          {/* Resend & Back actions */}
          <div className="flex flex-col gap-4 text-center text-sm">
            <div className="text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              {resendTimer > 0 ? (
                <span className="font-semibold text-foreground">Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="font-semibold text-primary hover:underline focus:outline-none"
                >
                  Resend Code
                </button>
              )}
            </div>

            <div className="border-t border-border/60 pt-4">
              <Link href="/auth" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
