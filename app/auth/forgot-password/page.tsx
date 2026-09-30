"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { showToast } from "@/components/shared/Toast"
import { Loader2, Mail, Compass, ArrowLeft, KeyRound } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordAction, getSystemSettingsAction } from "../actions"
import { getClientCachedSettings } from "@/lib/client-cache"
import LoadingOverlay from "@/components/shared/LoadingOverlay"
import { Suspense } from "react"

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

function ForgotPasswordContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [themeColorPrimary, setThemeColorPrimary] = React.useState("#D4AF37")
  const [brandName, setBrandName] = React.useState("MIGS THE SHORE")
  const [isEmailFocused, setIsEmailFocused] = React.useState(false)

  React.useEffect(() => {
    const cached = getClientCachedSettings()
    if (cached?.brandName) setBrandName(cached.brandName)
    if (cached?.themeColorPrimary) setThemeColorPrimary(cached.themeColorPrimary)

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

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (values: z.infer<typeof forgotSchema>) => {
    setIsLoading(true)
    startTransition(async () => {
      const result = await forgotPasswordAction(values.email)
      if (result.success) {
        if (result.otpAlreadySent) {
          showToast.info("Verification code already sent", "Please check your inbox or spam folder.")
        } else {
          showToast.success("Verification code sent!", "An 8-digit OTP code has been delivered to your email.")
        }
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(values.email)}`)
        }, 1500)
      } else {
        setIsLoading(false)
        showToast.error(result.error || "Failed to process request.")
      }
    })
  }

  const themeColor = "var(--primary)"

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side: Luxury split-screen hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <Image
          src="/images/auth-bg.png"
          alt="Luxury Resort Sanctuary"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center opacity-85 saturate-[1.1] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />

        <div className="absolute bottom-16 left-16 right-16 text-white space-y-4 text-left z-10">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight uppercase font-display">
            Account Recovery
          </h2>
          <p className="text-sm font-medium text-emerald-100/90 max-w-md leading-relaxed">
            Reclaim access to your reservations and member privileges with our encrypted verification protocols.
          </p>
        </div>
      </div>

      {/* Right side: Forgot Password Form */}
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
              <KeyRound className="h-6 w-6 text-primary" />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
              Forgot Password
            </h1>
            <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
              Enter your registered email address. We will send a secure password reset link to your email.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="forgot-email" className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">
                Email Address
              </Label>
              <div className="relative flex items-center">
                <Mail
                  className="absolute left-3 h-4 w-4 transition-colors duration-200"
                  style={{ color: isEmailFocused ? themeColor : undefined }}
                />
                <Input
                  id="forgot-email"
                  {...form.register("email")}
                  type="email"
                  placeholder="juan@email.com"
                  disabled={isPending}
                  className="pl-9 h-11 bg-background border-border text-foreground transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
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

            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-white h-11 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer transition-all opacity-95 hover:opacity-100"
              style={{ backgroundColor: themeColorPrimary }}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <LoadingOverlay isVisible={isLoading} title="Verifying Account" description="Preparing secure reset credentials..." />
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  )
}
