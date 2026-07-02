"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"
import { toast } from "sonner"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

import { Room } from "@/components/shared/RoomCard"
import BookingModal from "@/components/shared/BookingModal"
import { getHeroVideoUrlsAction, getSystemSettingsAction } from "@/app/auth/actions"

// Import Modular Sections
import Header from "./_sections/header"
import Hero from "./_sections/hero"
import About from "./_sections/about"
import Cinema from "./_sections/cinema"
import Rooms from "./_sections/rooms"
import Amenities from "./_sections/amenities"
import Location from "./_sections/location"
import Inquiry from "./_sections/inquiry"
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

export default function Home() {
  const router = useRouter()

  // Booking modal and auth states
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)

  // GSAP animation scope ref
  const mainScopeRef = React.useRef<HTMLDivElement | null>(null)

  // Video and system settings states
  const [videoSrc, setVideoSrc] = React.useState("")
  const [heroSubtitle, setHeroSubtitle] = React.useState("The Apex of Oceanfront Luxury")
  const [heroTitleLine1, setHeroTitleLine1] = React.useState("Where Sky Meets")
  const [heroTitleLine2, setHeroTitleLine2] = React.useState("Sanctuary")
  const [heroDescription, setHeroDescription] = React.useState("Nestled along the pristine sands of the Aegean coastline, Ocean Hill Resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.")
  
  const [themeColorPrimary, setThemeColorPrimary] = React.useState("#D4AF37")
  const [themeColorSecondary, setThemeColorSecondary] = React.useState("#FFFFFF")
  const [themeColorAccent, setThemeColorAccent] = React.useState("#1C1A17")
  
  const [brandName, setBrandName] = React.useState("Ocean Hill")
  const [brandLogo, setBrandLogo] = React.useState("")
  
  const [socialFacebook, setSocialFacebook] = React.useState("https://facebook.com")
  const [socialInstagram, setSocialInstagram] = React.useState("https://instagram.com")
  const [socialTiktok, setSocialTiktok] = React.useState("https://tiktok.com")
  const [socialTwitter, setSocialTwitter] = React.useState("https://twitter.com")

  const [isHeaderScrolled, setIsHeaderScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Inquiry Form prefill states (transferred from Hero reservation bar)
  const [selectedVilla, setSelectedVilla] = React.useState("royal-suite")
  const [securityTier, setSecurityTier] = React.useState("Standard Resort Guest")
  const [customRequests, setCustomRequests] = React.useState("")
  const [heroCheckIn] = React.useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  })
  const [heroGuests] = React.useState("2 Guests")

  const videoPlayerRef = React.useRef<HTMLVideoElement | null>(null)

  // Initialize data and settings
  React.useEffect(() => {
    // Determine video source dynamically
    const isMobile = window.matchMedia("(max-width: 768px)").matches

    getHeroVideoUrlsAction()
      .then((urls) => {
        setVideoSrc(isMobile ? urls.mobileUrl : urls.desktopUrl)
      })
      .catch((err) => {
        console.warn("[Video] Fallback to static videos:", err)
        setVideoSrc(isMobile ? "/videos/enhance_ocean_hill_villas_mobile.mp4" : "/videos/enhance_ocean_hill_villas.mp4")
      })

    // Fetch system configs
    getSystemSettingsAction()
      .then((settings) => {
        setHeroSubtitle(settings.heroSubtitle)
        setHeroTitleLine1(settings.heroTitleLine1)
        setHeroTitleLine2(settings.heroTitleLine2)
        setHeroDescription(settings.heroDescription)
        setThemeColorPrimary(settings.themeColorPrimary)
        setThemeColorSecondary(settings.themeColorSecondary)
        setThemeColorAccent(settings.themeColorAccent)
        setBrandName(settings.brandName || "Ocean Hill")
        setBrandLogo(settings.brandLogo || "")
        setSocialFacebook(settings.socialFacebook || "https://facebook.com")
        setSocialInstagram(settings.socialInstagram || "https://instagram.com")
        setSocialTiktok(settings.socialTiktok || "https://tiktok.com")
        setSocialTwitter(settings.socialTwitter || "https://twitter.com")
      })
      .catch((err) => {
        console.warn("[Settings] Error loading settings:", err)
      })

    // Preload suite images
    const imagesToPreload = [
      "/images/image7.webp",
      "/images/image1.png",
      "/images/image2.png",
      "/images/image3.png",
      "/images/image4.png",
      "/images/image5.png",
      "/images/image6.png"
    ]
    imagesToPreload.forEach((src) => {
      const img = new window.Image()
      img.src = src
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

  // Listen to scroll to switch header background opacity
  React.useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Execute GSAP scroll reveal trigger animations
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      // reveal elements
      const fadeUpElements = gsap.utils.toArray<HTMLElement>(".gsap-reveal-fade-up")
      fadeUpElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
              fastScrollEnd: true,
              preventOverlaps: true
            }
          }
        )
      })

      // stagger elements
      const staggerContainers = gsap.utils.toArray<HTMLElement>(".gsap-reveal-stagger-container")
      staggerContainers.forEach((container) => {
        const items = container.querySelectorAll(".gsap-reveal-stagger-item")
        gsap.fromTo(
          items,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              toggleActions: "play none none none",
              fastScrollEnd: true,
              preventOverlaps: true
            }
          }
        )
      })
    }, mainScopeRef)

    return () => ctx.revert()
  }, [])

  // Handle Book Modal Trigger
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

  // Handle Logout
  const handleLogOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Successfully logged out.")
    router.refresh()
  }

  // Handle inquiry transfer from Hero Booking bar to Bottom Form
  const handleHeroBookingSubmit = (villa: string, checkIn: string, checkOut: string, guests: string, curation: string) => {
    if (!villa) {
      toast.error("Please select a Suite or Villa for your sanctuary.")
      return
    }
    if (!checkIn || !checkOut) {
      toast.error("Please select your check-in and check-out dates.")
      return
    }
    if (!guests) {
      toast.error("Please specify guests and occupancy.")
      return
    }
    if (!curation) {
      toast.error("Please select your curation privileges tier.")
      return
    }

    setSelectedVilla(villa)
    setSecurityTier(curation)
    setCustomRequests(
      `Requesting booking stay:\nCheck-in Date: ${checkIn}\nCheck-out Date: ${checkOut}\nParty Count: ${guests}`
    )

    const inquirySection = document.getElementById("inquiry")
    if (inquirySection) {
      inquirySection.scrollIntoView({ behavior: "smooth" })

      const formCard = inquirySection.querySelector("div")
      if (formCard) {
        formCard.classList.add("ring-4", "ring-luxury-gold/50")
        setTimeout(() => {
          formCard.classList.remove("ring-4", "ring-luxury-gold/50")
        }, 2500)
      }
    }
  }

  return (
    <div ref={mainScopeRef} className="bg-luxury-obsidian text-luxury-cream font-sans min-h-screen">
      {/* Dynamic theme style overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --color-luxury-gold: ${themeColorPrimary};
          --color-luxury-obsidian: ${themeColorSecondary};
          --color-luxury-cream: ${themeColorAccent};
        }
      `}} />

      {/* Floating Header */}
      <Header
        brandName={brandName}
        brandLogo={brandLogo}
        isLoggedIn={isLoggedIn}
        isHeaderScrolled={isHeaderScrolled}
        onBookClick={handleBookClick}
        onLogOut={handleLogOut}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={setIsMobileMenuOpen}
        mockRooms={MOCK_ROOMS}
      />

      {/* Mobile Navigation Drawer Panel */}
      <div
        id="mobileNavPanel"
        className={`fixed right-0 top-0 h-full w-[85vw] max-w-[380px] bg-luxury-obsidian/95 border-l border-luxury-gold/20 z-40 transform transition-transform duration-500 ease-out shadow-2xl flex flex-col justify-between p-8 pb-10 pt-28 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0 backdrop-blur-2xl visible" : "translate-x-full backdrop-blur-none invisible"
        }`}
      >
        <nav className="flex flex-col gap-6 text-sm uppercase tracking-[0.25em] font-semibold text-luxury-cream">
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition-colors py-2 border-b border-luxury-gold/5">
            The Resort
          </a>
          <a href="#campaign" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition-colors py-2 border-b border-luxury-gold/5">
            The Cinema
          </a>
          <a href="#villas" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition-colors py-2 border-b border-luxury-gold/5">
            Suites & Villas
          </a>
          <a href="#amenities" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition-colors py-2 border-b border-luxury-gold/5">
            Amenities
          </a>
          <a href="#location" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition-colors py-2 border-b border-luxury-gold/5">
            The Beachfront
          </a>
        </nav>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false)
              handleBookClick(MOCK_ROOMS[0])
            }}
            className="w-full bg-gold-gradient text-luxury-obsidian py-4 rounded-full font-bold uppercase tracking-[0.25em] text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer text-center"
          >
            Reserve Experience
          </button>
          
          {isLoggedIn && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogOut()
              }}
              className="w-full border border-luxury-gold/40 text-luxury-cream py-4 rounded-full font-bold uppercase tracking-[0.25em] text-xs hover:bg-luxury-gold/10 transition-all cursor-pointer text-center"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* Cinematic Hero block */}
      <Hero
        videoSrc={videoSrc}
        heroSubtitle={heroSubtitle}
        heroTitleLine1={heroTitleLine1}
        heroTitleLine2={heroTitleLine2}
        heroDescription={heroDescription}
        themeColorPrimary={themeColorPrimary}
        onSearchSubmit={handleHeroBookingSubmit}
        videoPlayerRef={videoPlayerRef}
      />

      {/* Main scrolling elements */}
      <div className="relative z-10 bg-luxury-obsidian">
        {/* Resort story about section */}
        <About />

        {/* Cinematic campaign commercial display */}
        <Cinema />

        {/* Villas and Suites Showcase */}
        <Rooms mockRooms={MOCK_ROOMS} onBookClick={handleBookClick} />

        {/* Amenities Curation block */}
        <Amenities />

        {/* Location coordinates and layout map */}
        <Location />

        {/* Reservation Request inquiry form */}
        <Inquiry
          selectedVilla={selectedVilla}
          setSelectedVilla={setSelectedVilla}
          securityTier={securityTier}
          setSecurityTier={setSecurityTier}
          customRequests={customRequests}
          setCustomRequests={setCustomRequests}
          heroCheckIn={heroCheckIn}
          heroGuests={heroGuests}
        />

        {/* Footer */}
        <Footer
          brandName={brandName}
          brandLogo={brandLogo}
          socialFacebook={socialFacebook}
          socialInstagram={socialInstagram}
          socialTiktok={socialTiktok}
          socialTwitter={socialTwitter}
        />
      </div>

      {/* Dynamic Booking Modal integration */}
      <BookingModal room={selectedRoom} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
