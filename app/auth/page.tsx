"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Compass, Mail, Lock, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginWithEmailAction, signUpWithEmailAction, getSocialLoginUrlAction } from "./actions"

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
})

export default function AuthPage() {
  const [activeTab, setActiveTab] = React.useState<"login" | "signup">("login")
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  // Form hooks
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  })

  const handleEmailLogin = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      const result = await loginWithEmailAction(values)
      if (result.success) {
        toast.success("Successfully logged in!")
        router.push("/")
        router.refresh()
      } else {
        toast.error(result.error || "Login failed.")
      }
    })
  }

  const handleEmailSignUp = (values: z.infer<typeof signUpSchema>) => {
    startTransition(async () => {
      const result = await signUpWithEmailAction(values)
      if (result.success) {
        toast.success("Registration successful! Check your email for confirmation.")
        setActiveTab("login")
        loginForm.setValue("email", values.email)
      } else {
        toast.error(result.error || "Registration failed.")
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

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <Card className="w-full max-w-[420px] bg-card border-border shadow-xl rounded-2xl overflow-hidden">
        {/* Brand Header */}
        <div className="bg-primary/5 py-6 border-b border-border/40 flex flex-col items-center justify-center gap-1">
          <Compass className="h-8 w-8 text-primary animate-pulse" />
          <span className="font-bold tracking-tight text-foreground text-sm uppercase">Tala Resort Portal</span>
        </div>

        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-2xl font-bold">
            {activeTab === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {activeTab === "login" 
              ? "Access your dashboard and bookings" 
              : "Register to request reservations"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Custom Tabs */}
          <div className="grid grid-cols-2 bg-muted/60 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("login")
                signUpForm.reset()
              }}
              disabled={isPending}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "login" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup")
                loginForm.reset()
              }}
              disabled={isPending}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "signup" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Button */}
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => handleSocialLogin("google")}
              className="h-10 w-full flex items-center justify-center gap-2 border-border/80 bg-background hover:bg-muted/30 text-foreground rounded-xl"
            >
              {/* Google Icon SVG */}
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
              Google
            </Button>

            {/* Facebook Button */}
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => handleSocialLogin("facebook")}
              className="h-10 w-full flex items-center justify-center gap-2 border-border/80 bg-background hover:bg-muted/30 text-foreground rounded-xl"
            >
              <svg className="h-4 w-4 text-[#1877F2] fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/60"></div>
            <span className="flex-shrink mx-4 text-xs uppercase text-muted-foreground tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-border/60"></div>
          </div>

          {/* Forms */}
          {activeTab === "login" ? (
            // Login Form
            <form onSubmit={loginForm.handleSubmit(handleEmailLogin)} className="space-y-4">
              <FormField label="Email Address" error={loginForm.formState.errors.email?.message}>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...loginForm.register("email")}
                    type="email"
                    placeholder="juan@email.com"
                    disabled={isPending}
                    className="pl-9 h-10"
                  />
                </div>
              </FormField>

              <FormField label="Password" error={loginForm.formState.errors.password?.message}>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...loginForm.register("password")}
                    type="password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className="pl-9 h-10"
                  />
                </div>
              </FormField>

              <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground h-10 rounded-xl font-semibold">
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
          ) : (
            // Sign Up Form
            <form onSubmit={signUpForm.handleSubmit(handleEmailSignUp)} className="space-y-4">
              <FormField label="Full Name" error={signUpForm.formState.errors.fullName?.message}>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...signUpForm.register("fullName")}
                    placeholder="Juan dela Cruz"
                    disabled={isPending}
                    className="pl-9 h-10"
                  />
                </div>
              </FormField>

              <FormField label="Email Address" error={signUpForm.formState.errors.email?.message}>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...signUpForm.register("email")}
                    type="email"
                    placeholder="juan@email.com"
                    disabled={isPending}
                    className="pl-9 h-10"
                  />
                </div>
              </FormField>

              <FormField label="Password" error={signUpForm.formState.errors.password?.message}>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...signUpForm.register("password")}
                    type="password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className="pl-9 h-10"
                  />
                </div>
              </FormField>

              <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground h-10 rounded-xl font-semibold">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
