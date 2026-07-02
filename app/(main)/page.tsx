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
    id: "5br-6ba-private-pool-villa",
    name: "5BR/6BA Private Pool Villa",
    description: "Our premier signature resort residence. Boasts 5 luxurious bedrooms, 6 bathrooms, a private pool, a complete kitchen, and a spacious package inclusive of breakfast for 18 guests. Enjoy ocean views and elite comfort.",
    pricePerNight: 55000,
    capacity: 25,
    imageUrl: "/images/image7.webp",
    size: "5 Bedrooms / 6 Baths",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image7.webp", "/images/image.png", "/images/image5.png", "/images/image4.png"],
  },
  {
    id: "3br-3ba-private-pool-villa",
    name: "3BR/3BA Private Pool Villa",
    description: "A gorgeous coastal retreat featuring 3 beautifully appointed bedrooms, 3 bathrooms, and a private pool. The package includes breakfast for 12 guests, perfect for families and small groups.",
    pricePerNight: 41000,
    capacity: 20,
    imageUrl: "/images/image1.png",
    size: "3 Bedrooms / 3 Baths",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image1.png", "/images/image3.png", "/images/image4.png", "/images/image.png"],
  },
  {
    id: "2br-2ba-private-pool-villa-a",
    name: "2BR/2BA Private Pool Villa A",
    description: "Sleek and comfortable private villa hosting 2 bedrooms, 2 bathrooms, a private pool, and breakfast for 6 guests. Ideal for close-knit groups seeking a peaceful getaway.",
    pricePerNight: 21000,
    capacity: 8,
    imageUrl: "/images/image2.png",
    size: "2 Bedrooms / 2 Baths (A)",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image2.png", "/images/image6.png", "/images/image5.png", "/images/image3.png"],
  },
  {
    id: "2br-2ba-private-pool-villa-b",
    name: "2BR/2BA Private Pool Villa B",
    description: "A larger alternative to Villa A, featuring 2 bedrooms, 2 bathrooms, and a private pool. Accommodates up to 10 guests and includes breakfast for 6 guests.",
    pricePerNight: 23000,
    capacity: 10,
    imageUrl: "/images/image3.png",
    size: "2 Bedrooms / 2 Baths (B)",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image3.png", "/images/image4.png", "/images/image5.png", "/images/image6.png"],
  },
  {
    id: "1br-1ba-private-pool-villa",
    name: "1BR/1BA Private Pool Villa",
    description: "An intimate romantic sanctuary featuring 1 bedroom, 1 bathroom, and a private pool. The package includes breakfast for 2 guests, perfect for couples.",
    pricePerNight: 13000,
    capacity: 5,
    imageUrl: "/images/image4.png",
    size: "1 Bedroom / 1 Bath",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image4.png", "/images/image5.png", "/images/image6.png", "/images/image.png"],
  },
]

export default function Home() {
  const handleBookClick = React.useContext(BookingContext)

  // Database-backed rooms list state
  const [rooms, setRooms] = React.useState<Room[]>(MOCK_ROOMS)

  // Gallery Lightbox Modal States
  const [galleryRoom, setGalleryRoom] = React.useState<Room | null>(null)
  const [activeGalleryImageIndex, setActiveGalleryImageIndex] = React.useState(0)

  // Keyboard event listeners for the Gallery lightbox modal
  React.useEffect(() => {
    if (!galleryRoom) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const imgs = galleryRoom.images || [galleryRoom.imageUrl]
      if (e.key === "ArrowLeft") {
        setActiveGalleryImageIndex((prev) => (prev - 1 + imgs.length) % imgs.length)
      } else if (e.key === "ArrowRight") {
        setActiveGalleryImageIndex((prev) => (prev + 1) % imgs.length)
      } else if (e.key === "Escape") {
        setGalleryRoom(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [galleryRoom])

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
              start: "top 90%",
              toggleActions: "play none none none"
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
              start: "top 90%",
              toggleActions: "play none none none"
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
