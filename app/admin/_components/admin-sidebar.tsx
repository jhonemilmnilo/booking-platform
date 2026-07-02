"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { signOutAction } from "@/app/auth/actions"

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
  { name: "System Settings", href: "/admin/settings", icon: "fa-sliders" },
  {
    name: "Booking & Ledger",
    icon: "fa-calendar-days",
    subItems: [
      { name: "Active Bookings", href: "/admin/bookings" },
      { name: "Ledger", href: "/admin/ledger" },
    ],
  },
  { name: "Rooms & Suites", href: "/admin/rooms_suites", icon: "fa-hotel" },
]

export default function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const sidebarItems: SidebarItem[] = [
    { name: "Overview", href: "/admin", icon: "fa-chart-pie" },
    { name: "Hero Editor", href: "/admin/settings", icon: "fa-sliders" },
    { name: "System Settings", href: "/admin/system", icon: "fa-gears" },
    { name: "Bookings", href: "/admin/bookings", icon: "fa-calendar-days", comingSoon: true },
    { name: "Rooms & Suites", href: "/admin/rooms", icon: "fa-hotel", comingSoon: true },
  ]

  const handleSignOut = async () => {
    try {
      await signOutAction()
      toast.success("Signed out successfully.")
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("[Sidebar] Sign out failed:", err)
      toast.error("Failed to sign out.")
    }
  }

  return (
    <aside className="w-64 bg-[#16171b] border-r border-[#D4AF37]/20 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
            <i className="fa-solid fa-crown text-[#D4AF37] text-sm"></i>
          </div>
          <div>
            <span className="font-serif font-bold text-white text-sm tracking-widest block">OCEAN HILL</span>
            <span className="text-[9px] text-[#D4AF37] font-semibold tracking-widest uppercase block">Admin Core</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1.5">
          {sidebarItems.map((item) => {
            const hasSubItems = !!item.subItems && item.subItems.length > 0
            const isParentActive = hasSubItems && item.subItems!.some((sub) => pathname === sub.href)
            const isActive = !hasSubItems && pathname === item.href
            const isExpanded = !!expandedItems[item.name]

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      setExpandedItems((prev) => ({
                        ...prev,
                        [item.name]: !prev[item.name],
                      }))
                    } else if (!item.comingSoon && item.href) {
                      router.push(item.href)
                    } else {
                      toast.info(`${item.name} panel is coming soon!`)
                    }
                  }}
                  disabled={item.comingSoon}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all duration-300 ${isActive
                    ? "bg-[#D4AF37] text-[#1c1a17] font-bold shadow-lg"
                    : isParentActive
                      ? "text-white bg-white/5"
                      : "text-white/60 hover:text-white hover:bg-white/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${item.icon} text-sm ${isActive ? "text-[#1c1a17]" : "text-[#D4AF37]/80"}`}></i>
                    <span>{item.name}</span>
                  </div>
                  {hasSubItems ? (
                    <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isParentActive ? "text-white animate-pulse" : "text-white/40"}`}></i>
                  ) : item.comingSoon ? (
                    <span className="text-[8px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Soon
                    </span>
                  ) : null}
                </button>

                {/* Sub Items */}
                {hasSubItems && isExpanded && (
                  <div className="pl-6 space-y-1 mt-1">
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
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[11px] font-medium transition-all duration-300 ${isSubActive
                            ? "bg-[#D4AF37] text-[#1c1a17] font-bold shadow-md"
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
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs text-white/60 hover:text-[#ff4a4a] hover:bg-[#ff4a4a]/5 transition-all duration-300 cursor-pointer font-medium"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-sm text-[#ff4a4a]"></i>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
