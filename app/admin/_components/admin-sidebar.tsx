"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { getSystemSettingsAction, signOutAction } from "@/app/auth/actions"
import { getClientCachedSettings, setClientCachedSettings } from "@/lib/client-cache"
import LoadingOverlay from "@/components/shared/LoadingOverlay"

interface SubItem {
  name: string
  href: string
  comingSoon?: boolean
}

interface SidebarItem {
  name: string
  href?: string
  icon: string
  comingSoon?: boolean
  subItems?: SubItem[]
}

const sidebarItems: SidebarItem[] = [
  { name: "Overview", href: "/admin", icon: "fa-chart-pie" },
  { name: "Hero Editor", href: "/admin/settings", icon: "fa-sliders" },
  { name: "Amenities", href: "/admin/amenities", icon: "fa-concierge-bell" },
  { name: "Location & Attractions", href: "/admin/location", icon: "fa-map-location-dot" },
  { name: "System Settings", href: "/admin/system", icon: "fa-gears" },
  {
    name: "Booking & Ledger",
    icon: "fa-calendar-days",
    subItems: [
      { name: "Active Bookings", href: "/admin/bookings" },
      { name: "Ledger", href: "/admin/ledger" },
    ],
  },
  { name: "Rooms & Suites", href: "/admin/rooms_suites", icon: "fa-hotel" },
  { name: "Guest Diaries", href: "/admin/reviews", icon: "fa-camera-retro" },
]

interface AdminSidebarProps {
  initialBrandName?: string
  initialThemeColor?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function AdminSidebar({
  initialBrandName,
  initialThemeColor,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
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

  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({})

  const [brandName, setBrandName] = React.useState(() => {
    if (initialBrandName) return initialBrandName
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.brandName) return c.brandName
    }
    return "MIGS THE SHORE"
  })

  const [themeColorPrimary, setThemeColorPrimary] = React.useState(() => {
    if (initialThemeColor) return initialThemeColor
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.themeColorPrimary) return c.themeColorPrimary
    }
    return "#D4AF37"
  })

  const loadSettings = React.useCallback(() => {
    const cached = getClientCachedSettings()
    if (cached?.brandName) {
      setBrandName(cached.brandName)
    }
    if (cached?.themeColorPrimary) {
      setThemeColorPrimary(cached.themeColorPrimary)
    }
    getSystemSettingsAction()
      .then((s) => {
        if (s.brandName) setBrandName(s.brandName)
        if (s.themeColorPrimary) setThemeColorPrimary(s.themeColorPrimary)
        if (typeof window !== "undefined") {
          setClientCachedSettings({
            ...(getClientCachedSettings() || {}),
            brandName: s.brandName,
            themeColorPrimary: s.themeColorPrimary,
            themeColorSecondary: s.themeColorSecondary,
            themeColorAccent: s.themeColorAccent,
          })
        }
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    loadSettings()
    const handleUpdate = () => loadSettings()
    window.addEventListener("storage", handleUpdate)
    window.addEventListener("theme_settings_updated", handleUpdate)
    return () => {
      window.removeEventListener("storage", handleUpdate)
      window.removeEventListener("theme_settings_updated", handleUpdate)
    }
  }, [loadSettings])



  return (
    <aside
      className={`admin-sidebar-aside ${
        isCollapsed ? "w-20" : "w-64"
      } bg-[#16171b] border-r border-luxury-gold/20 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-x-hidden`}
    >
      {/* Brand Header */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-20 px-3.5 border-b border-white/5 flex items-center justify-between overflow-hidden shrink-0">
          <div className="flex items-center min-w-0">
            {/* Centered Crown: 52px wide container aligns icon center exactly at 40px */}
            <div className="w-[52px] h-10 flex items-center justify-center shrink-0">
              <div
                title={isCollapsed ? brandName : undefined}
                className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/30 shrink-0 shadow-sm"
              >
                <i className="fa-solid fa-crown text-luxury-gold text-sm"></i>
              </div>
            </div>

            {/* Brand Title and Subtitle: smoothly slides and fades */}
            <div
              className={`min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden whitespace-nowrap pl-1 ${
                isCollapsed
                  ? "max-w-0 opacity-0 -translate-x-3 pointer-events-none"
                  : "max-w-[130px] opacity-100 translate-x-0"
              }`}
            >
              <span className="font-serif font-bold text-[#1C1A17] dark:text-white text-sm tracking-widest block uppercase truncate">
                {brandName}
              </span>
              <span className="text-[9px] text-luxury-gold font-semibold tracking-widest uppercase block">
                Admin Core
              </span>
            </div>
          </div>

          {/* Collapse Toggle Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className={`w-7 h-7 rounded-lg bg-white/5 hover:bg-luxury-gold/20 text-white/50 hover:text-luxury-gold flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer border border-white/10 shrink-0 ${
                isCollapsed
                  ? "opacity-0 scale-75 pointer-events-none -translate-x-2 w-0 overflow-hidden border-0 p-0 m-0"
                  : "opacity-100 scale-100"
              }`}
            >
              <i className="fa-solid fa-angles-left text-xs"></i>
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="p-3.5 space-y-1.5 flex-1 overflow-x-hidden overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const hasSubItems = !!item.subItems && item.subItems.length > 0
            const isParentActive = hasSubItems && item.subItems!.some((sub) => pathname === sub.href)
            const isActive =
              !hasSubItems &&
              (pathname === item.href || (item.href === "/admin" && pathname === "/admin/overview"))
            const isExpanded = !!expandedItems[item.name]

            return (
              <div key={item.name} className="relative group">
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      if (isCollapsed) {
                        router.push(item.subItems![0].href)
                      } else {
                        setExpandedItems((prev) => ({
                          ...prev,
                          [item.name]: !prev[item.name],
                        }))
                      }
                    } else if (!item.comingSoon && item.href) {
                      router.push(item.href)
                    } else {
                      toast.info(`${item.name} panel is coming soon!`)
                    }
                  }}
                  disabled={item.comingSoon}
                  aria-label={item.name}
                  className={`w-full flex items-center h-11 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden cursor-pointer select-none ${
                    isActive || isParentActive
                      ? "bg-luxury-gold !text-white font-bold shadow-lg admin-sidebar-active-item"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  } ${item.comingSoon ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {/* Stable Icon Container: exactly 52px wide, center is at 14+26 = 40px in both states */}
                  <div className="w-[52px] h-11 flex items-center justify-center shrink-0">
                    <i
                      className={`fa-solid ${item.icon} text-base transition-colors duration-200 ${
                        isActive || isParentActive
                          ? "!text-white admin-sidebar-active-icon"
                          : "text-luxury-gold/80 group-hover:text-luxury-gold"
                      }`}
                      style={{ color: isActive || isParentActive ? "#FFFFFF" : undefined }}
                    ></i>
                  </div>

                  {/* Text Label & Badges: fluid width, opacity, and transform transition */}
                  <div
                    className={`flex-1 flex items-center justify-between min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden pr-3 ${
                      isCollapsed
                        ? "max-w-0 opacity-0 -translate-x-3 pointer-events-none"
                        : "max-w-[170px] opacity-100 translate-x-0"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold tracking-wide truncate ${
                        isActive || isParentActive ? "!text-white admin-sidebar-active-label" : ""
                      }`}
                      style={{ color: isActive || isParentActive ? "#FFFFFF" : undefined }}
                    >
                      {item.name}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.comingSoon && (
                        <span className="text-[7px] bg-white/10 text-white/50 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                          Soon
                        </span>
                      )}
                      {hasSubItems && (
                        <i
                          className={`fa-solid fa-chevron-right text-[10px] transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          } ${isActive || isParentActive ? "!text-white" : "text-white/40"}`}
                          style={{ color: isActive || isParentActive ? "#FFFFFF" : undefined }}
                        ></i>
                      )}
                    </div>
                  </div>
                </button>

                {/* Collapsed Tooltip / Sub-items Flyout */}
                <div
                  className={`absolute left-full ml-3 top-0 ${
                    hasSubItems ? "w-48 p-2" : "px-3 py-2 whitespace-nowrap"
                  } bg-[#181920] border border-white/10 rounded-xl shadow-2xl transition-all duration-200 z-50 pointer-events-none ${
                    isCollapsed
                      ? "group-hover:opacity-100 group-hover:pointer-events-auto opacity-0 translate-x-1 group-hover:translate-x-0"
                      : "opacity-0 hidden"
                  }`}
                >
                  {hasSubItems ? (
                    <div className="space-y-1">
                      <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider px-2 py-1 border-b border-white/5 mb-1">
                        {item.name}
                      </div>
                      {item.subItems!.map((sub) => {
                        const isSubActive = pathname === sub.href
                        return (
                          <button
                            key={sub.name}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!sub.comingSoon) {
                                router.push(sub.href)
                              } else {
                                toast.info(`${sub.name} panel is coming soon!`)
                              }
                            }}
                            disabled={sub.comingSoon}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                              isSubActive
                                ? "bg-luxury-gold text-white font-bold shadow-sm admin-sidebar-active-item"
                                : "text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
                            }`}
                          >
                            <span>{sub.name}</span>
                            {sub.comingSoon && (
                              <span className="text-[7px] bg-white/10 text-white/50 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                                Soon
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.comingSoon && (
                        <span className="text-[7px] bg-white/10 text-white/50 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                          Soon
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub Items Accordion (Expanded State) */}
                {hasSubItems && !isCollapsed && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                      isExpanded ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-[52px] pr-2 space-y-1 py-1">
                      {item.subItems!.map((sub) => {
                        const isSubActive = pathname === sub.href
                        return (
                          <button
                            key={sub.name}
                            onClick={() => {
                              if (!sub.comingSoon) {
                                router.push(sub.href)
                              } else {
                                toast.info(`${sub.name} panel is coming soon!`)
                              }
                            }}
                            disabled={sub.comingSoon}
                            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                              isSubActive
                                ? "bg-luxury-gold text-white font-bold shadow-md admin-sidebar-active-item"
                                : "text-white/50 hover:text-white hover:bg-white/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                          >
                            <span>{sub.name}</span>
                            {sub.comingSoon && (
                              <span className="text-[7px] bg-white/10 text-white/50 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                                Soon
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Log Out Section */}
      <div className="p-3.5 border-t border-black/5 dark:border-white/5 shrink-0 bg-transparent">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          aria-label="Log Out"
          title={isCollapsed ? "Log Out Session" : undefined}
          className="w-full flex items-center h-11 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden cursor-pointer select-none admin-sidebar-logout group disabled:opacity-50"
        >
          {/* Stable Icon Container: exactly 52px wide, center matches other icons */}
          <div className="w-[52px] h-11 flex items-center justify-center shrink-0">
            <i
              className={`fa-solid ${
                isLoggingOut ? "fa-circle-notch fa-spin" : "fa-arrow-right-from-bracket"
              } text-base transition-colors duration-200`}
            ></i>
          </div>

          {/* Text Label & Badge */}
          <div
            className={`flex-1 flex items-center justify-between min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden pr-3 ${
              isCollapsed
                ? "max-w-0 opacity-0 -translate-x-3 pointer-events-none"
                : "max-w-[170px] opacity-100 translate-x-0"
            }`}
          >
            <span className="text-xs font-semibold tracking-wide truncate">
              {isLoggingOut ? "Signing Out..." : "Log Out"}
            </span>
            <span className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 shrink-0 ml-2">
              Exit
            </span>
          </div>
        </button>
      </div>

      <LoadingOverlay
        isVisible={isLoggingOut}
        title="Securing Portal"
        description="Deauthorizing administrator session credentials..."
      />
    </aside>
  )
}
