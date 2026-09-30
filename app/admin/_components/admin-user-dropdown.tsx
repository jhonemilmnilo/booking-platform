"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signOutAction } from "@/app/auth/actions"
import LoadingOverlay from "@/components/shared/LoadingOverlay"

export default function AdminUserDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const [themeMode, setThemeMode] = React.useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("admin_theme_mode")
        if (saved === "light" || saved === "dark") return saved
        return document.documentElement.classList.contains("admin-light") ? "light" : "dark"
      } catch {
        return "dark"
      }
    }
    return "dark"
  })

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  // Sync initial theme
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_theme_mode") || "dark"
      const root = document.documentElement
      if (saved === "light") {
        root.classList.remove("dark")
        root.classList.add("light", "admin-light")
      } else {
        root.classList.remove("light", "admin-light")
        root.classList.add("dark")
      }
    } catch {}
  }, [])

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setThemeMode(newTheme)
    try {
      localStorage.setItem("admin_theme_mode", newTheme)
      const root = document.documentElement
      if (newTheme === "light") {
        root.classList.remove("dark")
        root.classList.add("light", "admin-light")
        toast.info("Switched to Light Appearance")
      } else {
        root.classList.remove("light", "admin-light")
        root.classList.add("dark")
        toast.info("Switched to Dark Appearance")
      }
    } catch {}
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    setIsOpen(false)
    try {
      await signOutAction()
      toast.success("Successfully logged out.")
      router.push("/auth/login")
      router.refresh()
    } catch {
      toast.error("An error occurred during logout.")
      setIsLoggingOut(false)
    }
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* ── Top Bar Trigger: Resort Admin Active Session ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="User profile and session menu"
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all cursor-pointer shadow-sm group"
      >
        <div className="w-7 h-7 rounded-lg bg-luxury-gold/15 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold text-xs shrink-0 group-hover:scale-105 transition-transform">
          <i className="fa-solid fa-user-shield"></i>
        </div>

        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-white tracking-wide leading-tight truncate">
            Resort Admin
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5 leading-none mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            Active Session
          </div>
        </div>

        <i
          className={`fa-solid fa-chevron-down text-[10px] text-white/40 group-hover:text-white/70 transition-transform duration-200 ml-0.5 ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      {/* ── Floating Dropdown Menu ── */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#14151b] border border-white/[0.12] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-150 backdrop-blur-xl space-y-3">
          {/* User Info Header */}
          <div className="flex items-center gap-3 p-2.5 bg-white/[0.03] rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/15 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold text-base shrink-0">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white tracking-wide truncate">
                Resort Administrator
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-0.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Session &bull; Superuser
              </div>
            </div>
          </div>

          {/* Theme Selector: Dark Mode & Light Mode */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-1 mb-1.5 flex items-center justify-between">
              <span>Theme Mode</span>
              <span className="text-luxury-gold font-mono text-[9px] uppercase font-bold">
                {themeMode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  themeMode === "dark"
                    ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <i className="fa-solid fa-moon text-xs"></i>
                <span>Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  themeMode === "light"
                    ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <i className="fa-solid fa-sun text-xs"></i>
                <span>Light Mode</span>
              </button>
            </div>
          </div>



          {/* Log Out Button */}
          <div className="pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <i
                  className={`fa-solid ${
                    isLoggingOut ? "fa-circle-notch fa-spin" : "fa-arrow-right-from-bracket"
                  }`}
                ></i>
                <span>{isLoggingOut ? "Signing Out..." : "Log Out Session"}</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-rose-400/80 font-bold px-2 py-0.5 rounded-md bg-rose-500/10">
                Exit
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Full-screen Loading Overlay on Logout */}
      <LoadingOverlay
        isVisible={isLoggingOut}
        title="Securing Portal"
        description="Deauthorizing administrator session credentials..."
      />
    </div>
  )
}
