"use client"

import * as React from "react"
import { toast } from "sonner"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

import { Room } from "@/components/shared/RoomCard"
import { getHeroVideoUrlsAction, getSystemSettingsAction } from "@/app/auth/actions"
import { BookingContext } from "./layout"

// Import Modular Sections
import Hero from "./_sections/hero"
import About from "./_sections/about"
import Cinema from "./_sections/cinema"
import Rooms from "./_sections/rooms"
import Amenities from "./_sections/amenities"
import Location from "./_sections/location"
import Inquiry from "./_sections/inquiry"

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
  const handleBookClick = React.useContext(BookingContext)

  // GSAP animation scope ref
  const mainScopeRef = React.useRef<HTMLDivElement | null>(null)

  // Video and system settings states
  const [videoSrc, setVideoSrc] = React.useState("")
  const [heroSubtitle, setHeroSubtitle] = React.useState("The Apex of Oceanfront Luxury")
  const [heroTitleLine1, setHeroTitleLine1] = React.useState("Where Sky Meets")
  const [heroTitleLine2, setHeroTitleLine2] = React.useState("Sanctuary")
  const [heroDescription, setHeroDescription] = React.useState("Nestled along the pristine sands of the Aegean coastline, Ocean Hill Resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.")

  // Inquiry Prefills
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
      {/* Cinematic Hero block */}
      <Hero
        videoSrc={videoSrc}
        heroSubtitle={heroSubtitle}
        heroTitleLine1={heroTitleLine1}
        heroTitleLine2={heroTitleLine2}
        heroDescription={heroDescription}
        themeColorPrimary="#D4AF37"
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
      </div>
    </div>
  )
}
