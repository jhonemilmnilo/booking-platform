"use client"

import * as React from "react"
import AdminSidebar from "./admin-sidebar"

interface AdminSidebarContextType {
  isCollapsed: boolean
  toggleCollapsed: () => void
}

export const AdminSidebarContext = React.createContext<AdminSidebarContextType>({
  isCollapsed: false,
  toggleCollapsed: () => {},
})

export const useAdminSidebar = () => React.useContext(AdminSidebarContext)

export function AdminSidebarToggle({ className = "" }: { className?: string }) {
  const { isCollapsed, toggleCollapsed } = useAdminSidebar()
  if (!isCollapsed) return null

  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      title="Expand sidebar"
      aria-label="Expand sidebar"
      className={`w-8 h-8 rounded-lg bg-white/5 hover:bg-luxury-gold/20 text-white/60 hover:text-luxury-gold flex items-center justify-center transition-all cursor-pointer border border-white/10 shrink-0 mr-1 shadow-sm ${className}`}
    >
      <i className="fa-solid fa-angles-right text-xs"></i>
    </button>
  )
}

interface AdminShellProps {
  initialBrandName?: string
  initialThemeColor?: string
  initialThemeSecondary?: string
  initialThemeAccent?: string
  children: React.ReactNode
}

export default function AdminShell({
  initialBrandName,
  initialThemeColor,
  initialThemeSecondary,
  initialThemeAccent,
  children,
}: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("admin_sidebar_collapsed") === "true"
      } catch {
        return false
      }
    }
    return false
  })

  // Synchronize on mount and handle storage changes across tabs
  React.useEffect(() => {
    try {
      const root = document.documentElement
      if (initialThemeColor) {
        root.style.setProperty("--theme-color-primary", initialThemeColor)
        root.style.setProperty("--color-luxury-gold", initialThemeColor)
      }

      const raw = localStorage.getItem("sanctuary_settings_cache_v2")
      const current = raw ? JSON.parse(raw).data : {}
      if (initialThemeColor) current.themeColorPrimary = initialThemeColor
      if (initialThemeSecondary) current.themeColorSecondary = initialThemeSecondary
      if (initialThemeAccent) current.themeColorAccent = initialThemeAccent
      if (initialBrandName) current.brandName = initialBrandName
      localStorage.setItem(
        "sanctuary_settings_cache_v2",
        JSON.stringify({ data: current, timestamp: Date.now() })
      )

      const saved = localStorage.getItem("admin_sidebar_collapsed") === "true"
      queueMicrotask(() => setIsCollapsed(saved))
      if (saved) {
        root.classList.add("admin-sidebar-collapsed")
      } else {
        root.classList.remove("admin-sidebar-collapsed")
      }

      const savedTheme = localStorage.getItem("admin_theme_mode")
      if (savedTheme === "light") {
        root.classList.remove("dark")
        root.classList.add("light", "admin-light")
      } else {
        root.classList.remove("light", "admin-light")
        root.classList.add("dark")
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "admin_sidebar_collapsed") {
        const next = e.newValue === "true"
        setIsCollapsed(next)
        if (next) {
          document.documentElement.classList.add("admin-sidebar-collapsed")
        } else {
          document.documentElement.classList.remove("admin-sidebar-collapsed")
        }
      }
      if (e.key === "admin_theme_mode") {
        if (e.newValue === "light") {
          document.documentElement.classList.remove("dark")
          document.documentElement.classList.add("light", "admin-light")
        } else {
          document.documentElement.classList.remove("light", "admin-light")
          document.documentElement.classList.add("dark")
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [initialThemeColor, initialThemeSecondary, initialThemeAccent, initialBrandName])

  const toggleCollapsed = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next))
        if (next) {
          document.documentElement.classList.add("admin-sidebar-collapsed")
        } else {
          document.documentElement.classList.remove("admin-sidebar-collapsed")
        }
      } catch {}
      return next
    })
  }, [])

  const contextValue = React.useMemo(
    () => ({ isCollapsed, toggleCollapsed }),
    [isCollapsed, toggleCollapsed]
  )

  return (
    <AdminSidebarContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#0b0c10] flex w-full">
        <AdminSidebar
          initialBrandName={initialBrandName}
          initialThemeColor={initialThemeColor}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapsed}
        />
        <div
          className={`admin-main-content flex-1 min-h-screen flex flex-col transition-[margin] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
            isCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          {children}
        </div>
      </div>
    </AdminSidebarContext.Provider>
  )
}
