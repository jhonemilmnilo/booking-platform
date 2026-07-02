"use client"

import * as React from "react"
import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getSystemSettingsAction } from "@/app/auth/actions"
import { Room } from "@/components/shared/RoomCard"
import BookingModal from "@/components/shared/BookingModal"
import Header from "./_sections/header"
import Footer from "./_sections/footer"

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

export const BookingContext = React.createContext<(room: Room) => void>(() => {})

export default function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Brand and settings
  const [brandName, setBrandName] = React.useState("Ocean Hill")
  const [brandLogo, setBrandLogo] = React.useState("")
  const [socialFacebook, setSocialFacebook] = React.useState("https://facebook.com")
  const [socialInstagram, setSocialInstagram] = React.useState("https://instagram.com")
  const [socialTiktok, setSocialTiktok] = React.useState("https://tiktok.com")
  const [socialTwitter, setSocialTwitter] = React.useState("https://twitter.com")

  const [themeColorPrimary, setThemeColorPrimary] = React.useState("#D4AF37")
  const [themeColorSecondary, setThemeColorSecondary] = React.useState("#FFFFFF")
  const [themeColorAccent, setThemeColorAccent] = React.useState("#1C1A17")

  // Initialize data and settings
  React.useEffect(() => {
    getSystemSettingsAction()
      .then((settings) => {
        setBrandName(settings.brandName || "Ocean Hill")
        setBrandLogo(settings.brandLogo || "")
        setSocialFacebook(settings.socialFacebook || "https://facebook.com")
        setSocialInstagram(settings.socialInstagram || "https://instagram.com")
        setSocialTiktok(settings.socialTiktok || "https://tiktok.com")
        setSocialTwitter(settings.socialTwitter || "https://twitter.com")
        setThemeColorPrimary(settings.themeColorPrimary || "#D4AF37")
        setThemeColorSecondary(settings.themeColorSecondary || "#FFFFFF")
        setThemeColorAccent(settings.themeColorAccent || "#1C1A17")
      })
      .catch((err) => {
        console.warn("[Layout Settings] Error loading settings:", err)
      })
  }, [])

  // Listen to auth changes
  React.useEffect(() => {
    const supabase = createClient()
    
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleBookClick = async (room: Room) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.info("Authentication required", {
        description: "Please sign in or register to book a luxury suite reservation."
      })
      router.push("/auth/login")
      return
    }
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  const handleLogOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      setIsLoggedIn(false)
      toast.success("Successfully logged out.")
      router.refresh()
    }
  }

  return (
    <BookingContext.Provider value={handleBookClick}>
      {/* Dynamic theme style overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --color-luxury-gold: ${themeColorPrimary};
          --color-luxury-obsidian: ${themeColorSecondary};
          --color-luxury-cream: ${themeColorAccent};
        }
      `}} />

      <Header
        brandName={brandName}
        brandLogo={brandLogo}
        isLoggedIn={isLoggedIn}
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
    </BookingContext.Provider>
  )
}
