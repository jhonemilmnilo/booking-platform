"use client"

import * as React from "react"
import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getSystemSettingsAction, getCurrentUserRoleAction } from "@/app/auth/actions"
import { Room } from "@/components/shared/RoomCard"
import BookingModal from "@/components/shared/BookingModal"
import Header from "./_sections/header"
import Footer from "./_sections/footer"
import LoadingOverlay from "@/components/shared/LoadingOverlay"
import { getClientCachedSettings, setClientCachedSettings } from "@/lib/client-cache"

const MOCK_ROOMS: Room[] = [
  {
    id: "royal-suite",
    name: "The Beachfront Royal Suite",
    description: "Steps from the water, this exquisite royal suite features a private swim-up pool, outdoor lounge overlooking the waves, and a dedicated personal beach concierge.",
    pricePerNight: 15500,
    capacity: 6,
    imageUrl: "/images/image7.webp",
    size: "6,800 Sq Ft",
    amenities: ["Private Swim-up Pool", "Beachfront Daybeds", "Personal Concierge", "Outdoor Spa Deck"],
  },
  {
    id: "garden-villa",
    name: "The Beachfront Garden Villa",
    description: "Optimized for spectacular sunsets, this spacious villa boasts a private beachfront deck, custom fire pits directly on the sand, and access to the resort's yacht charter launch.",
    pricePerNight: 18200,
    capacity: 8,
    imageUrl: "/images/image1.png",
    size: "8,200 Sq Ft",
    amenities: ["Beachfront Deck", "Outdoor Sand Firepit", "Deep-Immersion Tub", "Speedboat Charters"],
  },
  {
    id: "lagoon-suite",
    name: "The Oceanview Lagoon Suite",
    description: "A secluded garden sanctuary nestled next to our private lagoon pools. Excellent views of the palms and ocean reefs, perfect for a peaceful tropical getaway.",
    pricePerNight: 12000,
    capacity: 4,
    imageUrl: "/images/image2.png",
    size: "4,500 Sq Ft",
    amenities: ["Lagoon Swim Access", "Tropical Garden Room", "Reef Snorkeling Kit", "Private Yoga Coach"],
  },
]

export const BookingContext = React.createContext<(room: Room) => void>(() => { })

export default function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [isNavigatingToLogin, setIsNavigatingToLogin] = React.useState(false)
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Initial loading state
  const [isInitialLoading, setIsInitialLoading] = React.useState(true)

  // Brand and settings
  const [brandName, setBrandName] = React.useState("MIGS THE SHORE")
  const [brandLogo, setBrandLogo] = React.useState("")
  const [socialFacebook, setSocialFacebook] = React.useState("https://facebook.com")
  const [socialInstagram, setSocialInstagram] = React.useState("https://instagram.com")
  const [socialTiktok, setSocialTiktok] = React.useState("https://tiktok.com")
  const [socialTwitter, setSocialTwitter] = React.useState("https://twitter.com")

  const [themeColorPrimary, setThemeColorPrimary] = React.useState("#D4AF37")
  const [themeColorSecondary, setThemeColorSecondary] = React.useState("#FFFFFF")
  const [themeColorAccent, setThemeColorAccent] = React.useState("#1C1A17")

  // Initialize data and settings with client-side caching
  React.useEffect(() => {
    // 1. Immediately hydrate from cache to eliminate FOUC / wrong initial states
    const cached = getClientCachedSettings()
    let hasValidCache = false

    if (cached) {
      hasValidCache = true
      if (cached.brandName) setBrandName(cached.brandName)
      if (cached.brandLogo !== undefined) setBrandLogo(cached.brandLogo)
      if (cached.socialFacebook) setSocialFacebook(cached.socialFacebook)
      if (cached.socialInstagram) setSocialInstagram(cached.socialInstagram)
      if (cached.socialTiktok) setSocialTiktok(cached.socialTiktok)
      if (cached.socialTwitter) setSocialTwitter(cached.socialTwitter)
      if (cached.themeColorPrimary) setThemeColorPrimary(cached.themeColorPrimary)
      if (cached.themeColorSecondary) setThemeColorSecondary(cached.themeColorSecondary)
      if (cached.themeColorAccent) setThemeColorAccent(cached.themeColorAccent)
      applyThemeToDom(cached.themeColorPrimary, cached.themeColorSecondary, cached.themeColorAccent)
    }

    // 2. Fetch fresh settings from server (stale-while-revalidate)
    // If settings are already injected in the window by the server, use them to avoid a network roundtrip
    if (typeof window !== "undefined" && (window as any).__SYSTEM_SETTINGS__) {
      const settings = (window as any).__SYSTEM_SETTINGS__
      setBrandName(settings.brandName || "Ocean Hill")
      setBrandLogo(settings.brandLogo || "")
      setSocialFacebook(settings.socialFacebook || "https://facebook.com")
      setSocialInstagram(settings.socialInstagram || "https://instagram.com")
      setSocialTiktok(settings.socialTiktok || "https://tiktok.com")
      setSocialTwitter(settings.socialTwitter || "https://twitter.com")
      setThemeColorPrimary(settings.themeColorPrimary || "#D4AF37")
      setThemeColorSecondary(settings.themeColorSecondary || "#FFFFFF")
      setThemeColorAccent(settings.themeColorAccent || "#1C1A17")
      return
    }

    getSystemSettingsAction()
      .then((settings) => {
        setBrandName(settings.brandName || "MIGS THE SHORE")
        setBrandLogo(settings.brandLogo || "")
        setSocialFacebook(settings.socialFacebook || "https://facebook.com")
        setSocialInstagram(settings.socialInstagram || "https://instagram.com")
        setSocialTiktok(settings.socialTiktok || "https://tiktok.com")
        setSocialTwitter(settings.socialTwitter || "https://twitter.com")
        setThemeColorPrimary(settings.themeColorPrimary || "#D4AF37")
        setThemeColorSecondary(settings.themeColorSecondary || "#FFFFFF")
        setThemeColorAccent(settings.themeColorAccent || "#1C1A17")

        applyThemeToDom(settings.themeColorPrimary, settings.themeColorSecondary, settings.themeColorAccent)

        // Cache for subsequent reloads
        setClientCachedSettings(settings)
      })
      .catch((err) => {
        console.warn("[Layout Settings] Error loading settings:", err)
      })
      .finally(() => {
        setIsInitialLoading(false)
      })

    // If cached data was available, smoothly dismiss the initial loader after a brief luxury intro
    if (hasValidCache) {
      const timer = setTimeout(() => {
        setIsInitialLoading(false)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [])

  const applyThemeToDom = (primary?: string, secondary?: string, accent?: string) => {
    if (typeof document === "undefined") return
    const p = primary
    const s = secondary || "#FFFFFF"
    const a = accent || "#1C1A17"

    const styleEl = document.getElementById("system-theme-variables")
    if (styleEl && p) {
      styleEl.textContent = `:root{
        --theme-color-primary:${p};
        --theme-color-primary-light:color-mix(in srgb, ${p} 55%, white);
        --theme-color-primary-dark:color-mix(in srgb, ${p} 70%, black);
        --theme-color-secondary:${s};
        --theme-color-accent:${a};
        --color-luxury-gold:${p};
        --color-luxury-lightGold:color-mix(in srgb, ${p} 55%, white);
        --color-luxury-darkGold:color-mix(in srgb, ${p} 70%, black);
        --color-luxury-obsidian:${s};
        --color-luxury-charcoal:#F7F5F0;
        --color-luxury-cream:${a};
        --primary:${p};
      }`
    }

    const root = document.documentElement
    if (p) {
      root.style.setProperty("--theme-color-primary", p)
      root.style.setProperty("--theme-color-primary-light", `color-mix(in srgb, ${p} 55%, white)`)
      root.style.setProperty("--theme-color-primary-dark", `color-mix(in srgb, ${p} 70%, black)`)
      root.style.setProperty("--color-luxury-gold", p)
      root.style.setProperty("--color-luxury-lightGold", `color-mix(in srgb, ${p} 55%, white)`)
      root.style.setProperty("--color-luxury-darkGold", `color-mix(in srgb, ${p} 70%, black)`)
      root.style.setProperty("--primary", p)
    }
    if (secondary) {
      root.style.setProperty("--theme-color-secondary", secondary)
      root.style.setProperty("--color-luxury-obsidian", secondary)
    }
    if (accent) {
      root.style.setProperty("--theme-color-accent", accent)
      root.style.setProperty("--color-luxury-cream", accent)
    }
  }

  // Listen to auth changes and sync user role
  React.useEffect(() => {
    // 1. Immediately hydrate role from client cache if available
    if (typeof window !== "undefined") {
      const cachedRole = localStorage.getItem("user_role")
      if (cachedRole === "ADMIN") {
        setIsAdmin(true)
      }
    }

    const supabase = createClient()

    const syncUserRole = async () => {
      try {
        const res = await getCurrentUserRoleAction()
        if (res.isLoggedIn && res.role === "ADMIN") {
          setIsAdmin(true)
          if (typeof window !== "undefined") {
            localStorage.setItem("user_role", "ADMIN")
          }
        } else {
          setIsAdmin(false)
          if (typeof window !== "undefined") {
            if (res.role) {
              localStorage.setItem("user_role", res.role)
            } else {
              localStorage.removeItem("user_role")
            }
          }
        }
      } catch (err) {
        console.error("[MainLayout] Failed to sync user role:", err)
      }
    }

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      if (session) {
        syncUserRole()
      } else {
        setIsAdmin(false)
        if (typeof window !== "undefined") {
          localStorage.removeItem("user_role")
        }
      }
    }
    checkInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
      if (session) {
        syncUserRole()
      } else {
        setIsAdmin(false)
        if (typeof window !== "undefined") {
          localStorage.removeItem("user_role")
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleBookClick = async (room: Room) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setIsNavigatingToLogin(true)
      toast.info("Authentication required", {
        description: "Please sign in or register to book a luxury suite reservation."
      })
      setTimeout(() => {
        router.push("/auth/login")
      }, 1500)
      return
    }
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  const handleLogOut = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      setIsLoggingOut(false)
      toast.error(error.message)
    } else {
      setIsLoggedIn(false)
      setIsAdmin(false)
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_role")
      }
      toast.success("Successfully logged out.")
      setTimeout(() => {
        router.refresh()
        setIsLoggingOut(false)
      }, 1500)
    }
  }

  return (
    <BookingContext.Provider value={handleBookClick}>

      <Header
        brandName={brandName}
        brandLogo={brandLogo}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onBookClick={handleBookClick}
        onLogOut={handleLogOut}
        mockRooms={MOCK_ROOMS}
      />

      {children}

      <Footer
        brandName={brandName}
        brandLogo={brandLogo}
        socialFacebook={socialFacebook}
        socialInstagram={socialInstagram}
        socialTiktok={socialTiktok}
        socialTwitter={socialTwitter}
      />

      <BookingModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <LoadingOverlay
        isVisible={isLoggingOut}
        title="Securing Session"
        description="Logging out of your sanctuary access..."
      />

      <LoadingOverlay
        isVisible={isNavigatingToLogin}
        title="Redirecting to Gateway"
        description="Please wait while we establish your security verification gateway..."
      />

      <LoadingOverlay
        isVisible={isInitialLoading}
        solid={true}
        title="Accessing Sanctuary"
        description="Preparing your bespoke oceanfront experience..."
      />
    </BookingContext.Provider>
  )
}
