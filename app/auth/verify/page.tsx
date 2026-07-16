"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { showToast } from "@/components/shared/Toast"
import { Loader2, ShieldCheck, Mail, ArrowLeft, Compass } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { verifyOtpAction, resendOtpAction, getSystemSettingsAction, getOtpCooldownAction } from "../actions"
import LoadingOverlay from "@/components/shared/LoadingOverlay"

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
  const [themeColorPrimary, setThemeColorPrimary] = React.useState("#D4AF37")
  const [isLoading, setIsLoading] = React.useState(false)

  // Track active OTP session and initialize/restore the countdown timer from Redis/DB
  React.useEffect(() => {
    if (!email) return

    let isSubscribed = true
    getOtpCooldownAction(email)
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.remainingSeconds && res.remainingSeconds > 0) {
          setResendTimer(res.remainingSeconds)
        } else {
          setResendTimer(0)
        }
      })
      .catch((err) => console.error(err))

    return () => {
      isSubscribed = false
    }
  }, [email])

  React.useEffect(() => {
    getSystemSettingsAction()
      .then((settings) => {
        const primary = settings.theme_color_primary || settings.themeColorPrimary
        if (primary) {
          setThemeColorPrimary(primary)
        }
      })
      .catch((err) => console.warn(err))
  }, [])

  // Countdown timer for Resend button
  React.useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  })

  const onSubmit = (values: z.infer<typeof verifySchema>) => {
    if (!email) {
      showToast.error("Missing email address. Please go back and try again.")
      return
    }

    setIsLoading(true)
    startTransition(async () => {
      const result = await verifyOtpAction(email, values.code)
      if (result.success) {
        showToast.success("Identity verified successfully!")
        if (result.role === "ADMIN") {
          router.push("/admin/settings")
        } else {
          router.push("/")
        }
        router.refresh()
      } else {
        setIsLoading(false)
        showToast.error(result.error || "Verification failed.")
        if (result.code === "lockout") {
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
      const remaining = result.remainingSeconds || 60
      if (result.otpAlreadySent) {
        showToast.info("Verification code already sent", `Please check your inbox or spam folder. You can resend again in ${remaining}s.`)
      } else {
        showToast.success("A new 8-digit code has been sent to your email.")
      }
      setResendTimer(remaining)
    } else {
      showToast.error(result.error || "Failed to resend code.")
      if (result.code === "lockout") {
        router.push("/auth/signup")
      }
    }
  }

  const themeColor = "var(--primary)"
  const [isCodeFocused, setIsCodeFocused] = React.useState(false)

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side: Verification Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-muted/10">
        <div className="w-full max-w-[420px] space-y-6">
          
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <Compass className="h-7 w-7 text-primary" />
              <span className="font-bold text-sm uppercase tracking-wider text-foreground">Booking Platform</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
              Verify Email
            </h1>
            <p className="text-xs font-semibold text-muted-foreground">
              We sent an 8-digit verification code to <span className="font-bold text-foreground break-all">{email || "your email"}</span>.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="otp-code" className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">8-Digit OTP Code</Label>
              <div className="relative flex items-center">
                <Mail 
                  className="absolute left-3 h-4 w-4 transition-colors duration-200" 
                  style={{ color: isCodeFocused ? themeColor : undefined }}
                />
                <Input
                  id="otp-code"
                  {...form.register("code")}
                  placeholder="12345678"
                  maxLength={8}
                  disabled={isPending}
                  className="pl-9 h-11 text-center tracking-[0.3em] font-mono text-lg bg-background border-border text-foreground transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{
                    borderColor: isCodeFocused ? themeColor : undefined,
                    boxShadow: isCodeFocused ? `0 0 0 1px ${themeColor}` : undefined
                  }}
                  onFocus={() => setIsCodeFocused(true)}
                  onBlur={() => setIsCodeFocused(false)}
                />
              </div>
              {form.formState.errors.code && (
                <p className="text-[11px] text-destructive font-semibold mt-1">{form.formState.errors.code.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-white h-11 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer transition-all opacity-95 hover:opacity-100"
              style={{ backgroundColor: themeColorPrimary }}
            >
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
          <div className="flex flex-col gap-4 text-center text-sm pt-2">
            <div className="text-xs text-muted-foreground font-semibold">
              Didn&apos;t receive the code?{" "}
              {resendTimer > 0 ? (
                <span className="font-extrabold text-foreground">Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="font-extrabold text-primary hover:underline focus:outline-none cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </div>

            <div className="border-t border-border/50 pt-4">
              <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Right side: Premium split-screen image layout */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <Image
          src="/images/auth-bg.png"
          alt="Booking Platform Overwater Villa"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center opacity-85 saturate-[1.1] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16 text-white space-y-4 text-left z-10">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight uppercase font-display">
            Verify Your Session
          </h2>
          <p className="text-sm font-medium text-emerald-100/90 max-w-md leading-relaxed">
            Protecting your account is our highest priority. Enter the security code sent to your registered address to complete access.
          </p>
        </div>
      </div>
      
      {/* Premium Loader during successful verification redirect */}
      <LoadingOverlay 
        isVisible={isLoading} 
        title="Preparing Sanctuary" 
        description="Please wait while we finalize your luxury escape environment..." 
      />
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
