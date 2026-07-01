"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Compass, Mail, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginWithEmailAction, getSocialLoginUrlAction } from "../actions"

import { Suspense } from "react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

function LoginContent() {
  const [isPending, startTransition] = React.useTransition()
  const [showPassword, setShowPassword] = React.useState(false)
  const [attemptsLeft, setAttemptsLeft] = React.useState<number | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  // Focus states
  const [isEmailFocused, setIsEmailFocused] = React.useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false)

  React.useEffect(() => {
    if (errorParam) {
      toast.error(errorParam)
      const url = new URL(window.location.href)
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.pathname)
    }
  }, [errorParam])

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const handleEmailLogin = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      const result = await loginWithEmailAction(values)
      if (result.success) {
        if (result.otpRequired) {
          toast.success("Verification code sent to your email.")
          router.push(`/auth/verify?email=${encodeURIComponent(values.email)}`)
        } else {
          toast.success("Successfully logged in!")
          router.push("/")
          router.refresh()
        }
      } else {
        toast.error(result.error || "Login failed.")
        if (result.error?.includes("remaining")) {
          const match = result.error.match(/(\d+) attempt/)
          if (match) {
            setAttemptsLeft(parseInt(match[1], 10))
          }
        } else if (result.code === "lockout") {
          setAttemptsLeft(0)
        }
      }
    })
  }

  const handleSocialLogin = (provider: "google" | "facebook") => {
    startTransition(async () => {
      const origin = window.location.origin
      const result = await getSocialLoginUrlAction(provider, origin)
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        toast.error(result.error || `Failed to initiate ${provider} login.`)
      }
    })
  }

  const themeColor = "var(--primary)"

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side: Premium split-screen image layout */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <Image
          src="/images/auth-bg.png"
          alt="Tala Resort Overwater Villa"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center opacity-85 saturate-[1.1] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16 text-white space-y-4 text-left z-10">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-emerald-400 animate-spin-slow" />
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-300">Premium Tropical Sanctuary</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight uppercase font-display">
            Experience Tala Resort
          </h2>
          <p className="text-sm font-medium text-emerald-100/90 max-w-md leading-relaxed">
            Welcome to your digital portal. Sign in to view reservation queues, manage stay durations, and access exclusive oceanfront amenities.
          </p>
        </div>
      </div>

      {/* Right side: Login Card Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-muted/10">
        <div className="w-full max-w-[420px] space-y-6">
          
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <Compass className="h-7 w-7 text-primary" />
              <span className="font-bold text-sm uppercase tracking-wider text-foreground">Tala Portal</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">
              Sign In
            </h1>
            <p className="text-xs font-semibold text-muted-foreground">
              Please enter your details to access your account.
            </p>
          </div>

          {attemptsLeft !== null && attemptsLeft > 0 && attemptsLeft < 3 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-600 rounded-xl">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 leading-none">Warning: Remaining Attempts</h4>
                <p className="text-[11px] font-semibold text-amber-700/90 leading-normal mt-1">
                  You have <span className="font-extrabold text-amber-600">{attemptsLeft} attempt{attemptsLeft > 1 ? "s" : ""} remaining</span> before account lockout.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => handleSocialLogin("google")}
              className="h-11 w-full flex items-center justify-center gap-2 border-border/80 bg-background hover:bg-muted/30 text-foreground rounded-xl cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-.12 3.01-.8 4.27l3.19 2.47c1.87-1.73 2.95-4.28 2.95-7.3c0-.85-.13-1.7-.19-2.27z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.19-2.47c-.89.6-2.02.95-3.54.95c-3.13 0-5.78-2.11-6.73-4.96L1.22 17.58C3.21 21.5 7.28 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.61c-.25-.75-.39-1.55-.39-2.39c0-.84.14-1.64.39-2.39L1.22 6.94C.44 8.5 0 10.2 0 12c0 1.8.44 3.5 1.22 5.06l4.05-3.45z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0C7.28 0 3.21 2.5 1.22 6.42l4.05 3.45c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Google</span>
            </Button>

            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => handleSocialLogin("facebook")}
              className="h-11 w-full flex items-center justify-center gap-2 border-border/80 bg-background hover:bg-muted/30 text-foreground rounded-xl cursor-pointer"
            >
              <svg className="h-4 w-4 text-[#1877F2] fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Facebook</span>
            </Button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/50"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Or continue with</span>
            <div className="flex-grow border-t border-border/50"></div>
          </div>

          <form onSubmit={loginForm.handleSubmit(handleEmailLogin)} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="login-email" className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Email Address</Label>
              <div className="relative flex items-center">
                <Mail 
                  className="absolute left-3 h-4 w-4 transition-colors duration-200" 
                  style={{ color: isEmailFocused ? themeColor : undefined }}
                />
                <Input
                  id="login-email"
                  {...loginForm.register("email")}
                  type="email"
                  placeholder="juan@email.com"
                  disabled={isPending}
                  className="pl-9 h-11 bg-background border-border text-foreground transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{
                    borderColor: isEmailFocused ? themeColor : undefined,
                    boxShadow: isEmailFocused ? `0 0 0 1px ${themeColor}` : undefined
                  }}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-[11px] text-destructive font-semibold mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Password</Label>
              </div>
              <div className="relative flex items-center">
                <Lock 
                  className="absolute left-3 h-4 w-4 transition-colors duration-200" 
                  style={{ color: isPasswordFocused ? themeColor : undefined }}
                />
                <Input
                  id="login-password"
                  {...loginForm.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="pl-9 pr-9 h-11 bg-background border-border text-foreground transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{
                    borderColor: isPasswordFocused ? themeColor : undefined,
                    boxShadow: isPasswordFocused ? `0 0 0 1px ${themeColor}` : undefined
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 opacity-40 hover:opacity-100 focus:outline-none transition-colors cursor-pointer"
                  style={{ color: isPasswordFocused || showPassword ? themeColor : undefined, opacity: isPasswordFocused || showPassword ? 1 : undefined }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-[11px] text-destructive font-semibold mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground h-11 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
