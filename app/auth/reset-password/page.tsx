"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { showToast } from "@/components/shared/Toast"
import { Loader2, Mail, Lock, KeyRound, Eye, EyeOff, ArrowLeft, Compass, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordAction, updatePasswordWithSessionAction, forgotPasswordAction, getSystemSettingsAction } from "../actions"
import { getClientCachedSettings } from "@/lib/client-cache"
import { createClient } from "@/lib/supabase/client"
import LoadingOverlay from "@/components/shared/LoadingOverlay"
import { Suspense } from "react"

const resetSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    code: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""
  const codeParam = searchParams.get("code") || ""

  const [isLoading, setIsLoading] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [resendTimer, setResendTimer] = React.useState(60)
  const [isResending, setIsResending] = React.useState(false)
  const [themeColorPrimary, setThemeColorPrimary] = React.useState("#D4AF37")
  const [brandName, setBrandName] = React.useState("MIGS THE SHORE")
  const [isSessionVerified, setIsSessionVerified] = React.useState(false)

  // Focus states
  const [isEmailFocused, setIsEmailFocused] = React.useState(false)
  const [isCodeFocused, setIsCodeFocused] = React.useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false)
  const [isConfirmFocused, setIsConfirmFocused] = React.useState(false)

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: emailParam,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // 1. Detect if the user clicked the reset link from their email
  React.useEffect(() => {
    const supabase = createClient()

    // Handle PKCE code if redirected with ?code=
    if (codeParam) {
      supabase.auth.exchangeCodeForSession(codeParam).then(({ data, error }) => {
        if (!error && data?.session) {
          setIsSessionVerified(true)
          if (data.session.user?.email) {
            form.setValue("email", data.session.user.email)
          }
        }
      })
    }

    // Check if browser already has an active session from the recovery link hash (#access_token=...)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsSessionVerified(true)
        if (session.user.email) {
          form.setValue("email", session.user.email)
        }
      }
    })

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session?.user)) {
        setIsSessionVerified(true)
        if (session?.user?.email) {
          form.setValue("email", session.user.email)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [codeParam, form])

  React.useEffect(() => {
    const cached = getClientCachedSettings()
    queueMicrotask(() => {
      if (cached?.brandName) setBrandName(cached.brandName as string)
      if (cached?.themeColorPrimary) setThemeColorPrimary(cached.themeColorPrimary as string)
    })

    getSystemSettingsAction()
      .then((res) => {
        if (res.themeColorPrimary) {
          setThemeColorPrimary(res.themeColorPrimary)
        }
        if (res.brandName) {
          setBrandName(res.brandName)
        }
      })
      .catch((err) => console.warn(err))
  }, [])

  // Resend countdown
  React.useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // Keep email synced if param changes
  React.useEffect(() => {
    if (emailParam && !form.getValues("email")) {
      form.setValue("email", emailParam)
    }
  }, [emailParam, form])

  const handleResendCode = async () => {
    const email = form.getValues("email")
    if (!email) {
      showToast.error("Please enter your email address first.")
      return
    }

    setIsResending(true)
    const result = await forgotPasswordAction(email)
    setIsResending(false)

    if (result.success) {
      showToast.success("A fresh 8-digit verification code has been dispatched to your email.")
      setResendTimer(60)
    } else {
      showToast.error(result.error || "Failed to resend reset email.")
    }
  }

  const onSubmit = (values: z.infer<typeof resetSchema>) => {
    setIsLoading(true)
    startTransition(async () => {
      // 1. If verified via recovery link in email, use the authenticated session directly
      if (isSessionVerified) {
        const result = await updatePasswordWithSessionAction(values.newPassword)
        if (result.success) {
          showToast.success("Password reset successfully!", "You can now log in with your new password.")
          setTimeout(() => {
            router.push("/auth/login")
          }, 1500)
        } else {
          setIsLoading(false)
          showToast.error(result.error || "Password update failed. Please try requesting a new link.")
        }
        return
      }

      // 2. If entering an OTP code manually
      if (!values.code || values.code.trim().length < 6) {
        setIsLoading(false)
        showToast.error("Please enter the verification code or click the reset link in your email.")
        return
      }

      const result = await resetPasswordAction({
        email: values.email,
        code: values.code,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })

      if (result.success) {
        showToast.success("Password reset successfully!", "You can now log in with your new credentials.")
        setTimeout(() => {
          router.push("/auth/login")
        }, 1500)
      } else {
        setIsLoading(false)
        showToast.error(result.error || "Password reset failed.")
      }
    })
  }

  const themeColor = "var(--primary)"

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side: Hero Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <Image
          src="/images/auth-bg.png"
          alt="Ocean Sanctuary"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center opacity-85 saturate-[1.1] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />

        <div className="absolute bottom-16 left-16 right-16 text-white space-y-4 text-left z-10">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight uppercase font-display">
            Secure Your Portal
          </h2>
          <p className="text-sm font-medium text-emerald-100/90 max-w-md leading-relaxed">
            Choose a strong, unique password to safeguard your reservation details and personal concierge access.
          </p>
        </div>
      </div>

      {/* Right side: Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-muted/10">
        <div className="w-full max-w-[420px] space-y-6">
          <div className="space-y-2 text-left">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>

            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <Compass className="h-7 w-7 text-primary" />
              <span className="font-bold text-sm uppercase tracking-wider text-foreground">{brandName}</span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
              Set New Password
            </h1>
            <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
              {isSessionVerified
                ? "Your email verification is confirmed. Please specify your new password below."
                : "Follow the 'Reset password' link sent to your inbox, or enter the verification code below."}
            </p>
          </div>

          {/* Session Verified Indicator Banner */}
          {isSessionVerified ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 leading-none flex items-center gap-1.5">
                  <span>Identity Verified</span>
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                </h4>
                <p className="text-[11px] font-medium text-emerald-200/80 leading-normal">
                  You are authenticated via your email reset link. You can now set your new password without typing a code.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
              <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
                <Mail className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 text-left">
                <h5 className="text-[11px] font-bold text-foreground">Check your email</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Click the <strong>Reset password</strong> button inside the email you received, or enter your code below.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="reset-email" className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">
                Email Address
              </Label>
              <div className="relative flex items-center">
                <Mail
                  className="absolute left-3 h-4 w-4 transition-colors duration-200"
                  style={{ color: isEmailFocused ? themeColor : undefined }}
                />
                <Input
                  id="reset-email"
                  {...form.register("email")}
                  type="email"
                  readOnly={isSessionVerified}
                  placeholder="juan@email.com"
                  disabled={isPending}
                  className={`pl-9 h-11 bg-background border-border text-foreground transition-all focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    isSessionVerified ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  style={{
                    borderColor: isEmailFocused ? themeColor : undefined,
                    boxShadow: isEmailFocused ? `0 0 0 1px ${themeColor}` : undefined,
                  }}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-[11px] text-destructive font-semibold mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Verification Code (Only displayed if NOT already verified via email link) */}
            {!isSessionVerified && (
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reset-code" className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">
                    Verification Code (Optional if clicking email link)
                  </Label>
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isResending}
                    onClick={handleResendCode}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider disabled:opacity-50 disabled:hover:no-underline cursor-pointer disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : isResending ? "Resending..." : "Resend Link"}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <KeyRound
                    className="absolute left-3 h-4 w-4 transition-colors duration-200"
                    style={{ color: isCodeFocused ? themeColor : undefined }}
                  />
                  <Input
                    id="reset-code"
                    {...form.register("code")}
                    type="text"
                    placeholder="Enter code (or click email button)"
                    maxLength={10}
                    disabled={isPending}
                    className="pl-9 h-11 bg-background border-border text-foreground tracking-widest font-mono text-center sm:text-left transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{
                      borderColor: isCodeFocused ? themeColor : undefined,
                      boxShadow: isCodeFocused ? `0 0 0 1px ${themeColor}` : undefined,
                    }}
                    onFocus={() => setIsCodeFocused(true)}
                    onBlur={() => setIsCodeFocused(false)}
                  />
                </div>
                {form.formState.errors.code && (
                  <p className="text-[11px] text-destructive font-semibold mt-1">
                    {form.formState.errors.code.message}
                  </p>
                )}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="new-password" className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">
                New Password
              </Label>
              <div className="relative flex items-center">
                <Lock
                  className="absolute left-3 h-4 w-4 transition-colors duration-200"
                  style={{ color: isPasswordFocused ? themeColor : undefined }}
                />
                <Input
                  id="new-password"
                  {...form.register("newPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="pl-9 pr-9 h-11 bg-background border-border text-foreground transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{
                    borderColor: isPasswordFocused ? themeColor : undefined,
                    boxShadow: isPasswordFocused ? `0 0 0 1px ${themeColor}` : undefined,
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 opacity-40 hover:opacity-100 focus:outline-none transition-colors cursor-pointer"
                  style={{
                    color: isPasswordFocused || showPassword ? themeColor : undefined,
                    opacity: isPasswordFocused || showPassword ? 1 : undefined,
                  }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.newPassword && (
                <p className="text-[11px] text-destructive font-semibold mt-1">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="confirm-password" className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">
                Confirm Password
              </Label>
              <div className="relative flex items-center">
                <Lock
                  className="absolute left-3 h-4 w-4 transition-colors duration-200"
                  style={{ color: isConfirmFocused ? themeColor : undefined }}
                />
                <Input
                  id="confirm-password"
                  {...form.register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="pl-9 pr-9 h-11 bg-background border-border text-foreground transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{
                    borderColor: isConfirmFocused ? themeColor : undefined,
                    boxShadow: isConfirmFocused ? `0 0 0 1px ${themeColor}` : undefined,
                  }}
                  onFocus={() => setIsConfirmFocused(true)}
                  onBlur={() => setIsConfirmFocused(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 opacity-40 hover:opacity-100 focus:outline-none transition-colors cursor-pointer"
                  style={{
                    color: isConfirmFocused || showConfirmPassword ? themeColor : undefined,
                    opacity: isConfirmFocused || showConfirmPassword ? 1 : undefined,
                  }}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-[11px] text-destructive font-semibold mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
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
                  Updating password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Remembered your credentials?{" "}
              <Link href="/auth/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <LoadingOverlay isVisible={isLoading} title="Securing Account" description="Encrypting and finalizing your new password..." />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
