import * as React from "react"
import { redirect } from "next/navigation"
import AdminShell from "./_components/admin-shell"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma/client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?error=Please%20sign%20in%20to%20access%20the%20Admin%20Portal")
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: user.id },
        ...(user.email ? [{ email: user.email.toLowerCase() }] : [])
      ]
    },
    select: { role: true }
  })

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/?error=Unauthorized%20access")
  }

  // Pre-fetch resort theme settings on the server so initial render has the exact colors
  const settingsRecords = await prisma.systemSettings.findMany({
    where: {
      key: {
        in: [
          "theme_color_primary",
          "theme_color_secondary",
          "theme_color_accent",
          "brand_name",
          "brand_logo",
        ],
      },
    },
    select: { key: true, value: true },
  })
  const settingsMap = Object.fromEntries(settingsRecords.map((r) => [r.key, r.value]))
  const themeColorPrimary = settingsMap["theme_color_primary"] || "#D4AF37"
  const themeColorSecondary = settingsMap["theme_color_secondary"] || "#FFFFFF"
  const themeColorAccent = settingsMap["theme_color_accent"] || "#1C1A17"
  const brandName = settingsMap["brand_name"] || "MIGS THE SHORE"
  const brandLogo = settingsMap["brand_logo"] || ""

  return (
    <div className="min-h-screen bg-[#0b0c10] flex">
      {/* Server-injected CSS theme variables so the page never flashes default gold/yellow */}
      <style
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --theme-color-primary: ${themeColorPrimary};
              --theme-color-primary-light: color-mix(in srgb, ${themeColorPrimary} 55%, white);
              --theme-color-primary-dark: color-mix(in srgb, ${themeColorPrimary} 70%, black);
              --theme-color-secondary: ${themeColorSecondary};
              --theme-color-accent: ${themeColorAccent};
              --color-luxury-gold: ${themeColorPrimary};
              --color-luxury-lightGold: color-mix(in srgb, ${themeColorPrimary} 55%, white);
              --color-luxury-darkGold: color-mix(in srgb, ${themeColorPrimary} 70%, black);
              --color-luxury-obsidian: ${themeColorSecondary};
              --color-luxury-cream: ${themeColorAccent};
              --primary: ${themeColorPrimary};
            }
            html.admin-sidebar-collapsed .admin-sidebar-aside {
              width: 5rem !important;
            }
            html.admin-sidebar-collapsed .admin-sidebar-aside:hover,
            html.admin-sidebar-collapsed .admin-sidebar-aside.is-hovered {
              width: 16rem !important;
              box-shadow: 12px 0 35px -5px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 0, 0, 0.5) !important;
            }
            html.admin-sidebar-collapsed .admin-sidebar-aside:hover .admin-sidebar-brand-text,
            html.admin-sidebar-collapsed .admin-sidebar-aside.is-hovered .admin-sidebar-brand-text {
              max-width: 130px !important;
              opacity: 1 !important;
              transform: translateX(0) !important;
              pointer-events: auto !important;
            }
            html.admin-sidebar-collapsed .admin-sidebar-aside:hover .admin-sidebar-label,
            html.admin-sidebar-collapsed .admin-sidebar-aside.is-hovered .admin-sidebar-label,
            html.admin-sidebar-collapsed .admin-sidebar-aside:hover .admin-sidebar-logout-text,
            html.admin-sidebar-collapsed .admin-sidebar-aside.is-hovered .admin-sidebar-logout-text {
              max-width: 170px !important;
              opacity: 1 !important;
              transform: translateX(0) !important;
              pointer-events: auto !important;
            }
            html.admin-sidebar-collapsed .admin-sidebar-aside:hover .admin-sidebar-toggle-btn,
            html.admin-sidebar-collapsed .admin-sidebar-aside.is-hovered .admin-sidebar-toggle-btn {
              opacity: 1 !important;
              transform: scale(1) !important;
              width: 1.75rem !important;
              pointer-events: auto !important;
            }
            html.admin-sidebar-collapsed .admin-sidebar-aside:hover .admin-sidebar-tooltip,
            html.admin-sidebar-collapsed .admin-sidebar-aside.is-hovered .admin-sidebar-tooltip {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
            html.admin-sidebar-collapsed .admin-main-content {
              margin-left: 5rem !important;
            }
          `,
        }}
      />

      {/* Admin Shell Navigation and Main Content */}
      <AdminShell
        initialBrandName={brandName}
        initialBrandLogo={brandLogo}
        initialThemeColor={themeColorPrimary}
        initialThemeSecondary={themeColorSecondary}
        initialThemeAccent={themeColorAccent}
      >
        {children}
      </AdminShell>
    </div>
  )
}
