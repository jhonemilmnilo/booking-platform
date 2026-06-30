"use client"

import * as React from "react"
import Image from "next/image"
import BookingModal from "@/components/shared/BookingModal"
import { Room } from "@/components/shared/RoomCard"
import { createBookingAction } from "@/app/actions/booking"
import { toast } from "sonner"

const MOCK_ROOMS: Room[] = [
  {
    id: "royal-suite",
    name: "The Beachfront Royal Suite",
    description: "Steps from the water, this exquisite royal suite features a private swim-up pool, outdoor lounge overlooking the waves, and a dedicated personal beach concierge.",
    pricePerNight: 15500,
    capacity: 6,
    imageUrl: "/images/image.png",
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

const CAMPAIGN_REELS = [
  {
    tag: "Ad Feature: Sunset Horizon",
    title: "Campaign Reel I: Coastal Sunrise",
    duration: "14 sec Loop",
    previewUrl: "/images/image3.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-luxury-resort-swimming-pool-under-palm-trees-42521-large.mp4"
  },
  {
    tag: "Ad Feature: Sea Sanctuary",
    title: "Campaign Reel II: Lagoon Splendor",
    duration: "18 sec Loop",
    previewUrl: "/images/image6.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-villa-with-swimming-pool-and-palm-trees-during-sunset-42520-large.mp4"
  },
  {
    tag: "Ad Feature: Champagne Dusk",
    title: "Campaign Reel III: Seaside Sunset",
    duration: "11 sec Loop",
    previewUrl: "/images/image5.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-crystal-clear-swimming-pool-by-the-sea-40502-large.mp4"
  }
]

export default function Home() {
  // Modal Booking States
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Floating Header Scroll state
  const [isHeaderScrolled, setIsHeaderScrolled] = React.useState(false)

  // Mobile navigation drawer toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Audio Engine Refs & State
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const gainNodeRef = React.useRef<GainNode | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = React.useState(false)

  // Cinematic playlist state
  const [activeCampaignIndex, setActiveCampaignIndex] = React.useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false)
  const mainVideoPlayerRef = React.useRef<HTMLVideoElement | null>(null)

  // Suites carousel active index
  const [activeSuiteIndex, setActiveSuiteIndex] = React.useState(0)

  // Scroll Video Refs
  const heroWrapperRef = React.useRef<HTMLDivElement | null>(null)
  const heroVideoRef = React.useRef<HTMLVideoElement | null>(null)
  const heroContentRef = React.useRef<HTMLDivElement | null>(null)
  const heroScrollIndicatorRef = React.useRef<HTMLDivElement | null>(null)

  // Hero Booking search bar states
  const [heroVilla, setHeroVilla] = React.useState("royal-suite")
  const [heroCheckIn, setHeroCheckIn] = React.useState("")
  const [heroCheckOut, setHeroCheckOut] = React.useState("")
  const [heroGuests, setHeroGuests] = React.useState("2 Guests")
  const [heroCuration, setHeroCuration] = React.useState("Standard Resort Guest")

  // Bottom Bespoke Form Inquiry States
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [selectedVilla, setSelectedVilla] = React.useState("royal-suite")
  const [addon, setAddon] = React.useState("Private Airport Shuttle Only")
  const [duration, setDuration] = React.useState("3 Nights")
  const [securityTier, setSecurityTier] = React.useState("Standard Resort Guest")
  const [customRequests, setCustomRequests] = React.useState("")
  const [termsAccepted, setTermsAccepted] = React.useState(false)

  // Submission details
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [successData, setSuccessData] = React.useState<{
    reference: string
    roomName: string
    guestName: string
    nights: number
    totalPrice: number
  } | null>(null)

  // Initialize Dates and Header Scroll Listeners
  React.useEffect(() => {
    // Set default dates: tomorrow to 4 days after
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)
    const nextDay = new Date()
    nextDay.setDate(today.getDate() + 4)

    setTimeout(() => {
      setHeroCheckIn(tomorrow.toISOString().split("T")[0])
      setHeroCheckOut(nextDay.toISOString().split("T")[0])
    }, 0)

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => { })
      }
    }
  }, [])

  // Scroll Playhead Video Animation Effect (Optimized Throttled Seeking)
  React.useEffect(() => {
    const wrapper = heroWrapperRef.current
    const video = heroVideoRef.current
    const content = heroContentRef.current
    const indicator = heroScrollIndicatorRef.current

    if (!video) return

    // Ensure video is paused and doesn't autoplay
    video.pause()

    let targetScrollFraction = 0
    let currentScrollFraction = 0
    let animationFrameId: number

    // Cache layout metrics to avoid layout thrashing (getBoundingClientRect) on scroll
    let wrapperTop = 0
    let wrapperHeight = 0
    let viewportHeight = 0

    const updateLayoutMetrics = () => {
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      wrapperTop = rect.top + window.scrollY
      wrapperHeight = rect.height
      viewportHeight = window.innerHeight
    }

    // Initialize metrics
    updateLayoutMetrics()

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const pinStart = wrapperTop
      const pinEnd = wrapperTop + wrapperHeight - viewportHeight
      const pinRange = pinEnd - pinStart

      const relativeScroll = scrollTop - pinStart
      const scrollFraction = Math.max(0, Math.min(relativeScroll / pinRange, 1))

      targetScrollFraction = scrollFraction

      // Update header scrolled state
      const scrolled = scrollTop > pinEnd
      setIsHeaderScrolled(scrolled)
    }

    const tick = () => {
      // Lerp the scroll fraction for ultra-smooth transition
      const lerpFactor = 0.1 // Adjust between 0.05 (slower/smoother) and 0.2 (faster)
      currentScrollFraction += (targetScrollFraction - currentScrollFraction) * lerpFactor

      // Snap to target if very close
      if (Math.abs(targetScrollFraction - currentScrollFraction) < 0.0001) {
        currentScrollFraction = targetScrollFraction
      }

      // Update foreground DOM opacity & transform smoothly in the rAF loop
      if (content) {
        let contentOpacity = 0
        if (currentScrollFraction > 0) {
          contentOpacity = Math.min(1, currentScrollFraction / 0.2)
        }
        content.style.opacity = String(contentOpacity)
        content.style.transform = `translateY(${(20 * (1 - contentOpacity))}px)`
        content.style.pointerEvents = contentOpacity > 0.1 ? "auto" : "none"
      }

      if (indicator) {
        const indicatorOpacity = Math.max(0, 1 - currentScrollFraction / 0.3)
        indicator.style.opacity = String(indicatorOpacity)
      }

      // Perform throttled video seeking only when the video is not already seeking
      const duration = video.duration
      if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
        // Stop scrubbing 5 seconds before the video ends so it is "almost done" when covered
        const targetTime = currentScrollFraction * Math.max(0, duration - 5)

        // Avoid seeking if the decoder is currently busy or the target difference is negligible
        if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.015) {
          if (!video.paused) {
            video.pause()
          }
          video.currentTime = targetTime
        }
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", updateLayoutMetrics, { passive: true })
    animationFrameId = requestAnimationFrame(tick)

    const handleLoadedMetadata = () => {
      video.pause()
      updateLayoutMetrics()
      handleScroll()
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    if (video.readyState >= 1) {
      video.pause()
      updateLayoutMetrics()
      handleScroll()
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", updateLayoutMetrics)
      cancelAnimationFrame(animationFrameId)
      if (video) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
    }
  }, [])

  // Audio Engine Initializer
  const initOceanAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext

      const bufferSize = 2 * audioContext.sampleRate
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const noise = audioContext.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true

      const filter = audioContext.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = 350

      const lfo = audioContext.createOscillator()
      lfo.frequency.value = 0.08
      const lfoGain = audioContext.createGain()
      lfoGain.gain.value = 250

      const gainNode = audioContext.createGain()
      gainNode.gain.value = 0.25

      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)
      noise.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContext.destination)

      noise.start(0)
      lfo.start(0)

      gainNodeRef.current = gainNode
    } catch (err) {
      console.warn("Audio Context init blocked or not supported.", err)
    }
  }

  // Toggle ocean soundscapes
  const toggleOceanSound = () => {
    if (!audioContextRef.current) {
      initOceanAudio()
    }

    const audioContext = audioContextRef.current
    const gainNode = gainNodeRef.current
    if (!audioContext || !gainNode) return

    if (isAudioPlaying) {
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5)
      setTimeout(() => {
        audioContext.suspend()
      }, 1500)
      setIsAudioPlaying(false)
    } else {
      audioContext.resume().then(() => {
        gainNode.gain.setValueAtTime(0.001, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 2.0)
      })
      setIsAudioPlaying(true)
    }
  }

  // Handle cinematic playlist selection
  const switchCampaign = (index: number) => {
    setActiveCampaignIndex(index)
    setIsVideoPlaying(false)
    const player = mainVideoPlayerRef.current
    if (player) {
      player.src = CAMPAIGN_REELS[index].videoUrl
      player.load()
      player.pause()
    }
  }

  // Play/pause campaign video
  const togglePlayState = () => {
    const player = mainVideoPlayerRef.current
    if (!player) return

    if (isVideoPlaying) {
      player.pause()
      setIsVideoPlaying(false)
    } else {
      player.play().then(() => {
        setIsVideoPlaying(true)
      }).catch(err => {
        console.warn("Autoplay blocked. Loaded muted.", err)
      })
    }
  }

  // Carousel slider indices
  const nextSuite = () => {
    setActiveSuiteIndex((prev) => (prev + 1) % MOCK_ROOMS.length)
  }

  const prevSuite = () => {
    setActiveSuiteIndex((prev) => (prev - 1 + MOCK_ROOMS.length) % MOCK_ROOMS.length)
  }

  // Trigger global room booking modal
  const handleBookClick = (room: Room) => {
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  // Hero booking submit - Map and scroll to the bottom form
  const handleHeroBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setSelectedVilla(heroVilla)
    setSecurityTier(heroCuration)
    setCustomRequests(
      `Requesting booking stay:\nCheck-in Date: ${heroCheckIn}\nCheck-out Date: ${heroCheckOut}\nParty Count: ${heroGuests}`
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

  // Bottom Bespoke Form Submission Action Handler
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted) {
      toast.error("Please accept the stay curation validation terms first.")
      return
    }

    setIsSubmitting(true)
    try {
      // Calculate date ranges based on stay duration select or fallback to hero checkin
      let checkInDate = new Date()
      if (heroCheckIn) {
        checkInDate = new Date(heroCheckIn)
      } else {
        checkInDate.setDate(checkInDate.getDate() + 1) // Tomorrow
      }

      const nightsCount = duration === "3 Nights" ? 3 : duration === "7 Nights" ? 7 : 14
      const checkOutDate = new Date(checkInDate)
      checkOutDate.setDate(checkInDate.getDate() + nightsCount)

      const response = await createBookingAction({
        roomId: selectedVilla,
        guestName: fullName,
        guestEmail: email,
        guestPhone: phone || "N/A - Checked Via Portal", // phone placeholder
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guestsCount: heroGuests.includes("1") ? 1 : heroGuests.includes("2") ? 2 : heroGuests.includes("4") ? 4 : 6,
      })

      if (response.success && response.data) {
        setSuccessData({
          reference: response.data.reference,
          roomName: response.data.roomName,
          guestName: response.data.guestName,
          nights: response.data.nights,
          totalPrice: response.data.totalPrice,
        })
        toast.success("Bespoke reservation invitation dispatched!")
      } else {
        toast.error(response.error || "Failed to submit request.")
      }
    } catch {
      toast.error("An error occurred during submission. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeSuite = MOCK_ROOMS[activeSuiteIndex]

  return (
    <div className="bg-luxury-obsidian text-luxury-cream font-sans min-h-screen">
      {/* Floating Header */}
      <header
        id="mainHeader"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 py-6 px-6 md:px-12 flex justify-between items-center ${isHeaderScrolled
          ? "bg-luxury-obsidian/95 py-4 border-b border-luxury-gold/15 backdrop-blur-md shadow-2xl"
          : "bg-transparent"
          }`}
      >
        <div className="flex items-center gap-3 whitespace-nowrap flex-shrink-0">
          {/* Crest SVG */}
          <svg className="w-10 h-10 text-luxury-gold filter drop-shadow" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" fill="none" stroke="#D4AF37" strokeWidth="2" />
            <path d="M50 15 L75 30 L75 60 L50 82 L25 60 L25 30 Z" fill="none" stroke="#D4AF37" strokeDasharray="2,2" />
            <circle cx="50" cy="48" r="8" fill="#D4AF37" />
            <path d="M50 20 L50 40 M50 56 L50 78 M32 48 L42 48 M58 48 L68 48" stroke="#D4AF37" strokeWidth="1.5" />
          </svg>
          <span
            id="brandName"
            className={`font-serif text-xl md:text-2xl tracking-[0.25em] uppercase font-semibold transition-colors duration-300 whitespace-nowrap ${isHeaderScrolled ? "text-luxury-cream" : "text-white"
              }`}
          >
            Ocean <span className="text-luxury-gold">Hill</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <nav
          id="desktopNav"
          className={`hidden lg:flex items-center gap-4 xl:gap-8 text-[11px] xl:text-xs uppercase tracking-[0.2em] font-semibold transition-colors duration-300 whitespace-nowrap ${isHeaderScrolled ? "text-luxury-cream" : "text-white"
            }`}
        >
          <a href="#about" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
            The Resort
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
          </a>
          <a href="#campaign" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
            The Cinema
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
          </a>
          <a href="#villas" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
            Suites & Villas
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
          </a>
          <a href="#amenities" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
            Amenities
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
          </a>
          <a href="#location" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
            The Beachfront
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
          </a>
        </nav>

        {/* Sensory Toggles & Action */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Audio Toggle (Procedural Waves) */}
          <button
            id="audioToggleBtn"
            onClick={toggleOceanSound}
            className={`relative border border-luxury-gold/50 hover:border-luxury-gold text-luxury-gold p-3 rounded-full transition-all duration-300 group flex items-center justify-center backdrop-blur cursor-pointer ${isAudioPlaying ? "bg-luxury-gold/20" : "bg-luxury-charcoal/40"
              }`}
            aria-label="Toggle Ocean Ambient Soundscape"
          >
            <i
              id="audioIcon"
              className={`fa-solid transition-transform duration-300 group-hover:scale-110 ${isAudioPlaying ? "fa-volume-high animate-pulse" : "fa-volume-xmark"
                }`}
            ></i>
            <span className="absolute right-12 bg-luxury-obsidian/90 border border-luxury-gold/30 px-3 py-1 rounded text-[10px] tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase font-serif">
              {isAudioPlaying ? "Mute Ocean Soundscape" : "Play Sea Soundscape"}
            </span>
          </button>

          <button
            onClick={() => handleBookClick(MOCK_ROOMS[0])}
            className="hidden sm:inline-block bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-semibold text-xs uppercase tracking-[0.2em] px-6 py-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          >
            Reserve Experience
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-luxury-cream hover:text-luxury-gold text-2xl p-2 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        id="mobileDrawer"
        className={`fixed inset-0 bg-luxury-obsidian/95 z-50 transform transition-transform duration-500 ease-out flex flex-col justify-center items-center gap-8 p-6 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-8 right-8 text-luxury-gold text-3xl hover:scale-110 transition-transform cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <svg className="w-16 h-16 text-luxury-gold mb-4" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" strokeWidth="2" />
          <circle cx="50" cy="48" r="8" fill="#D4AF37" />
        </svg>

        <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold">The Resort</a>
        <a href="#campaign" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold">The Cinema</a>
        <a href="#villas" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold">Suites & Villas</a>
        <a href="#amenities" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold">Amenities</a>
        <a href="#location" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-2xl tracking-widest text-luxury-cream hover:text-luxury-gold">The Beachfront</a>

        <button
          onClick={() => {
            setIsMobileMenuOpen(false)
            handleBookClick(MOCK_ROOMS[0])
          }}
          className="mt-8 bg-gold-gradient text-luxury-obsidian px-8 py-4 rounded-full font-semibold uppercase tracking-[0.25em] text-sm cursor-pointer"
        >
          Reserve Experience
        </button>
      </div>

      {/* Hero scroll-wrapper */}
      <div id="hero-scroll-wrapper" ref={heroWrapperRef} className="relative h-[300vh]">
        <section id="hero" className="fixed top-0 left-0 h-screen w-full flex items-center justify-center overflow-hidden z-0">
          {/* Background Loop */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-luxury-obsidian">
            {/* Scroll-Driven Video */}
            <video
              id="heroVideo"
              ref={heroVideoRef}
              muted
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.95]"
            >
              <source src="/ocean_hill_villa.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Foreground content */}
          <div
            id="heroContent"
            ref={heroContentRef}
            className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center select-none mt-16 transition-all duration-300"
          >
            <span className="text-luxury-gold font-semibold tracking-[0.4em] uppercase text-xs md:text-sm mb-4 animate-pulse-slow">
              <i className="fa-regular fa-star mr-2"></i> The Apex of Oceanfront Luxury <i className="fa-regular fa-star ml-2"></i>
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl tracking-wider text-white mb-6 leading-tight">
              Where Sky Meets <br />
              <span className="text-gold-gradient italic font-normal">Sanctuary</span>
            </h1>
            <p className="text-white/90 max-w-2xl text-sm md:text-lg tracking-wide font-light leading-relaxed mb-10">
              Nestled along the pristine sands of the Aegean coastline, Ocean Hill Resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.
            </p>

            {/* Quick Booking Bar */}
            <div className="w-full max-w-6xl mt-12 bg-white/95 backdrop-blur border border-luxury-gold/40 rounded-2xl md:rounded-full p-4 shadow-2xl gold-glow text-left">
              <form onSubmit={handleHeroBookingSubmit} className="flex flex-col md:flex-row items-center gap-4 md:gap-0 justify-between text-luxury-cream">
                {/* 1. Selection: Villa / Suite */}
                <div className="w-full md:w-1/4 px-4 md:border-r border-luxury-cream/10">
                  <label className="block text-[9px] tracking-widest text-luxury-cream/50 uppercase font-bold mb-1">SUITE / VILLA</label>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-hotel text-luxury-gold text-xs"></i>
                    <select
                      value={heroVilla}
                      onChange={(e) => setHeroVilla(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold focus:outline-none cursor-pointer border-none p-0"
                    >
                      <option value="royal-suite">Beachfront Royal Suite</option>
                      <option value="garden-villa">Beachfront Garden Villa</option>
                      <option value="lagoon-suite">Oceanview Lagoon Suite</option>
                    </select>
                  </div>
                </div>

                {/* 2. Dates */}
                <div className="w-full md:w-1/3 px-4 md:border-r border-luxury-cream/10">
                  <label className="block text-[9px] tracking-widest text-luxury-cream/50 uppercase font-bold mb-1">CHECK IN / OUT</label>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar-days text-luxury-gold text-xs"></i>
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="date"
                        required
                        value={heroCheckIn}
                        onChange={(e) => setHeroCheckIn(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold focus:outline-none w-1/2 cursor-pointer border-none p-0"
                      />
                      <span className="text-luxury-cream/30 text-xs">→</span>
                      <input
                        type="date"
                        required
                        value={heroCheckOut}
                        onChange={(e) => setHeroCheckOut(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold focus:outline-none w-1/2 cursor-pointer border-none p-0"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Guests */}
                <div className="w-full md:w-1/5 px-4 md:border-r border-luxury-cream/10">
                  <label className="block text-[9px] tracking-widest text-luxury-cream/50 uppercase font-bold mb-1">ROOMS & GUESTS</label>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-user-group text-luxury-gold text-xs"></i>
                    <select
                      value={heroGuests}
                      onChange={(e) => setHeroGuests(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold focus:outline-none cursor-pointer border-none p-0"
                    >
                      <option value="1 Guest">1 Room, 1 Guest</option>
                      <option value="2 Guests">1 Room, 2 Guests</option>
                      <option value="4 Guests">1 Room, 4 Guests</option>
                      <option value="6 Guests">2 Rooms, 6 Guests</option>
                    </select>
                  </div>
                </div>

                {/* 4. Curation level */}
                <div className="w-full md:w-1/5 px-4 md:mr-2">
                  <label className="block text-[9px] tracking-widest text-luxury-cream/50 uppercase font-bold mb-1">CURATION LEVEL</label>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-star text-luxury-gold text-xs"></i>
                    <select
                      value={heroCuration}
                      onChange={(e) => setHeroCuration(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold focus:outline-none cursor-pointer border-none p-0"
                    >
                      <option value="Standard Resort Guest">Standard Resort Guest</option>
                      <option value="VIP Beach Club Access">VIP Beach Club Access</option>
                      <option value="Presidential All-Inclusive Access">Presidential Access</option>
                    </select>
                  </div>
                </div>

                {/* 5. Submit */}
                <div className="w-full md:w-auto px-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-gold-gradient text-luxury-obsidian font-bold text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-xl md:rounded-full hover:brightness-110 shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    RESERVE STAY
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div
            id="heroScrollIndicator"
            ref={heroScrollIndicatorRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-float transition-opacity duration-300"
          >
            <span className="text-[10px] tracking-[0.3em] uppercase text-luxury-gold/80">Descend</span>
            <div className="w-[2px] h-12 bg-gradient-to-b from-luxury-gold to-transparent rounded-full animate-pulse"></div>
          </div>
        </section>
      </div>

      {/* Scrollable Page Content Layer (Slides up to cover fixed Hero background video) */}
      <div className="relative z-10 bg-luxury-obsidian">
        {/* Sanctuary Story Section */}
        <section id="about" className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-obsidian to-luxury-charcoal relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Collage */}
            <div className="relative grid grid-cols-12 gap-4">
              <div className="col-span-8 overflow-hidden rounded-2xl border border-luxury-gold/20 gold-glow">
                <div className="relative w-full h-[350px]">
                  <Image
                    src="/images/image6.png"
                    alt="Villa Exterior Pool"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="col-span-4 self-end overflow-hidden rounded-2xl border border-luxury-gold/20 shadow-xl">
                <div className="relative w-full h-[180px]">
                  <Image
                    src="/images/image4.png"
                    alt="Villa Interior Lounge"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="col-span-4 overflow-hidden rounded-2xl border border-luxury-gold/20 shadow-xl">
                <div className="relative w-full h-[180px]">
                  <Image
                    src="/images/image3.png"
                    alt="Ocean Sunset Balcony"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="col-span-8 overflow-hidden rounded-2xl border border-luxury-gold/20 gold-glow">
                <div className="relative w-full h-[220px]">
                  <Image
                    src="/images/image5.png"
                    alt="Drone Vista Ocean Hill"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-luxury-obsidian/90 border border-luxury-gold text-center py-6 px-8 rounded-xl backdrop-blur-md shadow-2xl select-none">
                <span className="font-serif text-3xl text-luxury-gold block font-semibold">100%</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-luxury-cream">Absolute Privacy</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8 lg:pl-6">
              <div className="space-y-4">
                <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">The Shoreline Escape</span>
                <h2 className="font-serif text-3xl md:text-5xl text-luxury-cream leading-tight">
                  A Beachfront Paradise of <br />
                  <span className="text-gold-gradient italic">Unrivaled Luxury</span>
                </h2>
              </div>

              <p className="text-luxury-cream/70 leading-relaxed font-light text-base md:text-lg">
                Nestled directly on the {"ocean's"} edge, Ocean Hill Resort combines luxury living with the raw beauty of the Aegean coast. Designed for ultimate relaxation, our open-concept layouts, private white sand beaches, and lagoon pools offer direct views of the Aegean waves, creating a seamless connection between resort grandeur and the sea.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-luxury-gold/10">
                <div>
                  <span className="text-2xl font-serif text-luxury-gold block font-bold">150</span>
                  <span className="text-[10px] tracking-widest text-luxury-cream/50 uppercase">Luxury Suites</span>
                </div>
                <div>
                  <span className="text-2xl font-serif text-luxury-gold block font-bold">Private</span>
                  <span className="text-[10px] tracking-widest text-luxury-cream/50 uppercase">Beach Club</span>
                </div>
                <div>
                  <span className="text-2xl font-serif text-luxury-gold block font-bold">Lagoon</span>
                  <span className="text-[10px] tracking-widest text-luxury-cream/50 uppercase">Infinity Pools</span>
                </div>
              </div>

              {/* Alert */}
              <div className="bg-luxury-obsidian/40 border-l-2 border-luxury-gold p-4 rounded-r-lg flex items-center gap-4">
                <div className="text-luxury-gold text-2xl animate-pulse">
                  <i className="fa-solid fa-wind"></i>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-luxury-cream">Full-Sensory Atmosphere Activated</h4>
                  <p className="text-xs text-luxury-cream/60">Turn on the coastal audio generator in your navigation to unlock ambient binaural seaside rhythms.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cinematic Campaign Section */}
        <section id="campaign" className="py-24 md:py-36 px-6 md:px-12 bg-luxury-obsidian relative">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Exclusive Campaigns</span>
              <h2 className="font-serif text-4xl md:text-6xl text-luxury-cream">
                The Cinematic <span className="text-gold-gradient italic">Showcase</span>
              </h2>
              <p className="text-luxury-cream/60 max-w-2xl mx-auto text-sm md:text-base">
                Immerse yourself in our cinematic commercials designed to evoke the essence of true oceanfront luxury living.
              </p>
            </div>

            {/* Player Grid */}
            <div className="bg-luxury-charcoal/40 border border-luxury-gold/30 rounded-3xl overflow-hidden p-4 md:p-8 gold-glow">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Major Player */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-luxury-gold/10 group shadow-inner">
                    {/* Preview Image */}
                    <div className={`absolute inset-0 transition-transform duration-700 brightness-[0.85] ${isVideoPlaying ? "hidden" : "block group-hover:scale-102"}`}>
                      <Image
                        id="mainVideoPreview"
                        src={CAMPAIGN_REELS[activeCampaignIndex].previewUrl}
                        alt="Cinematic Preview"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Gradient shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    {/* HTML5 Video Player */}
                    <video
                      id="mainVideoPlayer"
                      ref={mainVideoPlayerRef}
                      className={`absolute inset-0 w-full h-full object-cover ${isVideoPlaying ? "block" : "hidden"}`}
                      loop
                      muted
                      playsInline
                    ></video>

                    {/* Play Overlay */}
                    <button
                      id="playBtnOverlay"
                      onClick={togglePlayState}
                      className={`absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all duration-300 group/btn cursor-pointer ${isVideoPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                        }`}
                    >
                      <div className="w-20 h-20 rounded-full bg-gold-gradient text-luxury-obsidian flex items-center justify-center shadow-2xl transform group-hover/btn:scale-110 transition-transform duration-300">
                        <i id="playBtnIcon" className={`fa-solid text-2xl ${isVideoPlaying ? "fa-pause" : "fa-play ml-1"}`}></i>
                      </div>
                    </button>

                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-luxury-obsidian/95 border border-luxury-gold/40 text-[10px] tracking-[0.2em] uppercase text-luxury-gold px-3.5 py-1.5 rounded-full font-semibold backdrop-blur flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span id="campaignTag">{CAMPAIGN_REELS[activeCampaignIndex].tag}</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                      <span id="campaignTitle" className="font-serif text-lg text-white font-semibold drop-shadow-md">
                        {CAMPAIGN_REELS[activeCampaignIndex].title}
                      </span>
                      <span id="campaignDuration" className="text-xs text-luxury-lightGold font-semibold">
                        {CAMPAIGN_REELS[activeCampaignIndex].duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracks (Right side) */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-luxury-gold uppercase tracking-[0.2em] text-[11px] font-bold block mb-1">Select Campaign Reel</span>

                    {CAMPAIGN_REELS.map((reel, index) => (
                      <button
                        key={index}
                        onClick={() => switchCampaign(index)}
                        className={`w-full text-left rounded-xl p-4 transition-all duration-300 flex items-center gap-4 group cursor-pointer ${index === activeCampaignIndex
                          ? "bg-luxury-obsidian border border-luxury-gold border-gold-gradient shadow-md"
                          : "bg-luxury-charcoal/20 border border-white/10 hover:border-luxury-gold/40"
                          }`}
                      >
                        <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-luxury-charcoal">
                          <Image src={reel.previewUrl} alt={reel.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <i className="fa-solid fa-circle-play text-white/90 text-sm"></i>
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-serif text-sm text-luxury-cream group-hover:text-luxury-gold transition-colors truncate">
                            {reel.title.replace("Campaign Reel ", "")}
                          </h4>
                          <p className="text-[10px] text-luxury-cream/50 uppercase tracking-widest mt-0.5">
                            {index === 0 ? "Beachfront Lounge" : index === 1 ? "Poolside Cabanas" : "Beachfront Dining"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Specs */}
                  <div className="p-4 bg-luxury-obsidian rounded-xl border border-luxury-gold/15 space-y-2">
                    <span className="text-luxury-gold font-semibold uppercase text-[10px] tracking-widest block">Featured Spec</span>
                    <div className="flex items-center gap-2 text-xs text-luxury-cream/80">
                      <i className="fa-solid fa-camera-retro text-luxury-gold"></i>
                      <span>Filmed in 8K Ultra-High Dynamic Range</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-luxury-cream/80">
                      <i className="fa-solid fa-headphones text-luxury-gold"></i>
                      <span>Surround-Sound Spatial Design</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Gallery */}
        <section id="villas" className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-charcoal to-luxury-obsidian relative">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Select Your Domain</span>
                <h2 className="font-serif text-4xl md:text-6xl text-luxury-cream">
                  The Luxury <span className="text-gold-gradient italic">Suites & Villas</span>
                </h2>
              </div>
              <p className="text-luxury-cream/60 max-w-md text-sm leading-relaxed">
                Select from our curated beachfront villas and oceanfront suites, each offering direct access to the warm sands and private infinity pools.
              </p>
            </div>

            {/* Suite Showcase interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              {/* Details Box */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-luxury-obsidian/80 border border-luxury-gold/30 rounded-3xl p-8 md:p-10 gold-glow relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-luxury-gold/5 rounded-full blur-2xl"></div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-luxury-gold/10 pb-4">
                    <span className="text-luxury-gold font-bold uppercase tracking-[0.25em] text-xs">
                      {activeSuiteIndex === 0 ? "Oceanfront Club Wing" : activeSuiteIndex === 1 ? "West Beach Shoreline" : "East Lagoon Gardens"}
                    </span>
                    <span className="font-serif text-lg text-luxury-cream font-semibold">
                      ₱{activeSuite.pricePerNight.toLocaleString()}{" "}
                      <span className="text-[10px] font-sans text-luxury-cream/50 uppercase tracking-widest">/ Night</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-3xl md:text-4xl text-luxury-cream font-bold">{activeSuite.name}</h3>
                    <p className="text-luxury-cream/70 text-sm leading-relaxed">{activeSuite.description}</p>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-3 pt-4">
                    <span className="text-luxury-gold font-semibold uppercase text-[10px] tracking-widest block">Suite Amenities</span>
                    <ul className="grid grid-cols-2 gap-3 text-xs text-luxury-cream/90">
                      {activeSuite.amenities.map((amenity, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <i
                            className={`fa-solid text-luxury-gold ${i === 0 ? "fa-droplet" : i === 1 ? "fa-wine-glass" : i === 2 ? "fa-key" : "fa-spa"
                              }`}
                          ></i>
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Dot Indicators & CTA */}
                <div className="mt-10 pt-6 border-t border-luxury-gold/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex gap-2">
                    {MOCK_ROOMS.map((_, i) => (
                      <span
                        key={i}
                        className={`h-2.5 rounded-full transition-all duration-300 ${i === activeSuiteIndex ? "w-6 bg-luxury-gold" : "w-2.5 bg-luxury-gold/20"
                          }`}
                      ></span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleBookClick(activeSuite)}
                    className="w-full sm:w-auto text-center bg-gold-gradient text-luxury-obsidian font-bold text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow transition-all duration-300 hover:scale-102 cursor-pointer"
                  >
                    Configure Itinerary
                  </button>
                </div>
              </div>

              {/* Display Showcase */}
              <div className="lg:col-span-7 relative h-[450px] lg:h-auto rounded-3xl overflow-hidden border border-luxury-gold/20">
                <Image src={activeSuite.imageUrl} alt={activeSuite.name} fill className="object-cover transition-transform duration-1000" />

                {/* Overlay with navigation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-6">
                  <div className="self-end bg-luxury-obsidian/90 border border-luxury-gold/30 px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-semibold text-white">
                    <i className="fa-regular fa-eye mr-1"></i> Virtual Tour Enabled
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevSuite}
                      className="w-12 h-12 rounded-full bg-luxury-obsidian/80 hover:bg-luxury-gold text-white hover:text-luxury-obsidian border border-luxury-gold/30 flex items-center justify-center transition-all duration-300 transform hover:-translate-x-1 cursor-pointer"
                      aria-label="Previous Suite"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={nextSuite}
                      className="w-12 h-12 rounded-full bg-luxury-obsidian/80 hover:bg-luxury-gold text-white hover:text-luxury-obsidian border border-luxury-gold/30 flex items-center justify-center transition-all duration-300 transform hover:translate-x-1 cursor-pointer"
                      aria-label="Next Suite"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-xs text-white bg-luxury-obsidian/90 border border-luxury-gold/20 rounded-xl p-4 backdrop-blur-sm">
                    <span>
                      <i className="fa-solid fa-vector-square text-luxury-gold mr-1"></i> {activeSuite.size}
                    </span>
                    <span>
                      <i className="fa-solid fa-panorama text-luxury-gold mr-1"></i>{" "}
                      {activeSuiteIndex === 0
                        ? "180° Aegean Views"
                        : activeSuiteIndex === 1
                          ? "Unobstructed Sunsets"
                          : "Lagoon & Coral Views"}
                    </span>
                    <span>
                      <i className="fa-solid fa-user-group text-luxury-gold mr-1"></i> Up to {activeSuite.capacity} VIPs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curated Lifestyle & Amenities Section */}
        <section id="amenities" className="py-24 md:py-36 px-6 md:px-12 bg-luxury-obsidian relative">
          <div className="absolute top-1/2 left-10 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Tailored Lifestyles</span>
              <h2 className="font-serif text-4xl md:text-6xl text-luxury-cream">
                Your Absolute <span className="text-gold-gradient italic">Prerogative</span>
              </h2>
              <p className="text-luxury-cream/60 max-w-2xl mx-auto text-sm md:text-base">
                Every detail of your stay is curated by certified luxury hospitality concierges, matching standard European royal protocols.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-xl bg-luxury-obsidian border border-luxury-gold/30 flex items-center justify-center text-luxury-gold text-2xl group-hover:bg-luxury-gold group-hover:text-luxury-obsidian transition-colors duration-300">
                    <i className="fa-solid fa-umbrella-beach"></i>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl text-luxury-cream">Private Beach Club</h4>
                    <p className="text-luxury-cream/60 text-sm leading-relaxed">
                      Enjoy exclusive access to our private white sand cove, fully serviced with luxury loungers, double daybeds, and dedicated beachside waiters.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] tracking-widest text-luxury-gold uppercase block mt-6">Beachfront</span>
              </div>

              {/* Card 2 */}
              <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-xl bg-luxury-obsidian border border-luxury-gold/30 flex items-center justify-center text-luxury-gold text-2xl group-hover:bg-luxury-gold group-hover:text-luxury-obsidian transition-colors duration-300">
                    <i className="fa-solid fa-ship"></i>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl text-luxury-cream">Water Sports & Charters</h4>
                    <p className="text-luxury-cream/60 text-sm leading-relaxed">
                      Paddleboards, sea kayaks, and custom luxury yacht charters are available directly from the resort pier for coastal exploration.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] tracking-widest text-luxury-gold uppercase block mt-6">Sea Adventures</span>
              </div>

              {/* Card 3 */}
              <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-xl bg-luxury-obsidian border border-luxury-gold/30 flex items-center justify-center text-luxury-gold text-2xl group-hover:bg-luxury-gold group-hover:text-luxury-obsidian transition-colors duration-300">
                    <i className="fa-solid fa-utensils"></i>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl text-luxury-cream">Fine Oceanfront Dining</h4>
                    <p className="text-luxury-cream/60 text-sm leading-relaxed">
                      Indulge in gourmet Mediterranean cuisine crafted from locally sourced ingredients, served directly over the water under the stars.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] tracking-widest text-luxury-gold uppercase block mt-6">Gourmet Dining</span>
              </div>

              {/* Card 4 */}
              <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-xl bg-luxury-obsidian border border-luxury-gold/30 flex items-center justify-center text-luxury-gold text-2xl group-hover:bg-luxury-gold group-hover:text-luxury-obsidian transition-colors duration-300">
                    <i className="fa-solid fa-water"></i>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl text-luxury-cream">Poolside Loungers</h4>
                    <p className="text-luxury-cream/60 text-sm leading-relaxed">
                      Relax beside our heated lagoon and infinity pools, featuring comfortable double daybeds, private cabanas, and towel service.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] tracking-widest text-luxury-gold uppercase block mt-6">Relaxation</span>
              </div>

              {/* Card 5 */}
              <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-xl bg-luxury-obsidian border border-luxury-gold/30 flex items-center justify-center text-luxury-gold text-2xl group-hover:bg-luxury-gold group-hover:text-luxury-obsidian transition-colors duration-300">
                    <i className="fa-solid fa-spa"></i>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl text-luxury-cream">Wellness & Spa Pavilion</h4>
                    <p className="text-luxury-cream/60 text-sm leading-relaxed">
                      Experience world-class massage therapy, sauna sessions, and wellness treatments designed to restore body and mind right on the shore.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] tracking-widest text-luxury-gold uppercase block mt-6">Holistic Health</span>
              </div>

              {/* Card 6 */}
              <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-xl bg-luxury-obsidian border border-luxury-gold/30 flex items-center justify-center text-luxury-gold text-2xl group-hover:bg-luxury-gold group-hover:text-luxury-obsidian transition-colors duration-300">
                    <i className="fa-solid fa-martini-glass-citrus"></i>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl text-luxury-cream">Sunset Cabana Bar</h4>
                    <p className="text-luxury-cream/60 text-sm leading-relaxed">
                      Sip custom botanical cocktails, fresh juices, and premium wines served directly to your lounge chair by our expert mixologists.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] tracking-widest text-luxury-gold uppercase block mt-6">Seaside Drinks</span>
              </div>
            </div>
          </div>
        </section>

        {/* Map & Coordinates */}
        <section id="location" className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-obsidian to-luxury-charcoal relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">The Location</span>
                <h2 className="font-serif text-3xl md:text-5xl text-luxury-cream leading-tight">
                  Poised Above the <br />
                  <span className="text-gold-gradient italic">Aegean Horizon</span>
                </h2>
              </div>

              <p className="text-luxury-cream/70 leading-relaxed font-light text-base">
                Accessible directly via scenic coastal highways, private yacht tenders, or our beachside boardwalk. Ocean Hill occupies a prime oceanfront location offering unrivaled panoramic views while staying secluded in a private sandy cove.
              </p>

              {/* Distances */}
              <div className="space-y-4">
                <span className="text-luxury-gold font-bold uppercase text-[10px] tracking-widest block">Transit Proximity</span>
                <div className="space-y-2 text-sm text-luxury-cream/80">
                  <div className="flex justify-between border-b border-luxury-gold/10 pb-2">
                    <span>Mykonos Town</span>
                    <span className="text-luxury-gold font-semibold">10 mins Shore Drive</span>
                  </div>
                  <div className="flex justify-between border-b border-luxury-gold/10 pb-2">
                    <span>International Airport</span>
                    <span className="text-luxury-gold font-semibold">15 mins Resort Shuttle</span>
                  </div>
                  <div className="flex justify-between border-b border-luxury-gold/10 pb-2">
                    <span>Private Beach Cove</span>
                    <span className="text-luxury-gold font-semibold">2 mins Garden Path Walk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Representation */}
            <div className="lg:col-span-7 bg-luxury-obsidian/60 border border-luxury-gold/30 rounded-3xl overflow-hidden p-3 gold-glow">
              <div className="relative h-[380px] rounded-2xl overflow-hidden bg-luxury-charcoal flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-40 mix-blend-color-dodge bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')" }}
                ></div>

                {/* Rings */}
                <div className="absolute w-[300px] h-[300px] border border-luxury-gold/10 rounded-full animate-pulse-slow"></div>
                <div className="absolute w-[500px] h-[500px] border border-luxury-gold/5 rounded-full"></div>

                {/* Pin */}
                <div className="absolute z-10 flex flex-col items-center animate-bounce">
                  <div className="bg-gold-gradient p-3 rounded-full text-luxury-obsidian shadow-2xl relative">
                    <i className="fa-solid fa-anchor text-lg"></i>
                    <span className="absolute -inset-2 rounded-full border border-luxury-gold animate-ping opacity-40"></span>
                  </div>
                  <span className="mt-2 bg-luxury-obsidian/95 border border-luxury-gold text-luxury-cream text-[10px] tracking-widest uppercase font-serif px-3 py-1.5 rounded-lg shadow-lg">
                    Ocean Hill Resort & Spa
                  </span>
                </div>

                {/* Coordinates */}
                <div className="absolute bottom-4 left-4 bg-luxury-obsidian/90 border border-luxury-gold/20 px-3.5 py-2 rounded-xl text-[10px] tracking-wider text-luxury-gold font-mono">
                  LAT 37.4467° N / LONG 25.3289° E
                </div>

                {/* Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button className="w-8 h-8 rounded-lg bg-luxury-obsidian/90 border border-luxury-gold/30 text-luxury-cream flex items-center justify-center text-xs hover:border-luxury-gold transition-colors cursor-pointer">
                    <i className="fa-solid fa-plus"></i>
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-luxury-obsidian/90 border border-luxury-gold/30 text-luxury-cream flex items-center justify-center text-xs hover:border-luxury-gold transition-colors cursor-pointer">
                    <i className="fa-solid fa-minus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry Form Wizard */}
        <section id="inquiry" className="py-24 md:py-36 px-6 md:px-12 bg-luxury-obsidian relative">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-luxury-charcoal to-luxury-obsidian border border-luxury-gold rounded-3xl p-8 md:p-12 relative overflow-hidden gold-glow">
            <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-luxury-gold/5 rounded-full blur-3xl"></div>
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-luxury-gold/5 rounded-full blur-3xl"></div>

            <div className="space-y-8 text-center mb-10">
              <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Resort Reservation Access</span>
              <h2 className="font-serif text-3xl md:text-5xl text-luxury-cream">
                Bespoke <span className="text-gold-gradient italic">Reservation Request</span>
              </h2>
              <p className="text-luxury-cream/60 text-sm max-w-lg mx-auto leading-relaxed">
                Ocean Hill Resort operates on curated guest access. Complete our inquiry form to verify availability, and our private concierge will contact you within 2 hours.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleInquirySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                    Full Guest Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Sir Sebastian Thorne"
                    className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all placeholder:text-luxury-cream/35"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                    Secure Correspondence Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., guest@eminent.com"
                    className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all placeholder:text-luxury-cream/35"
                  />
                </div>

                {/* Secure Phone Input */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                    Secure Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +30 210 555 9821"
                    className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all placeholder:text-luxury-cream/35"
                  />
                </div>

                {/* Preferred Villa */}
                <div className="space-y-2">
                  <label htmlFor="villaSelect" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                    Select Preferred Suite / Villa
                  </label>
                  <select
                    id="villaSelect"
                    value={selectedVilla}
                    onChange={(e) => setSelectedVilla(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="royal-suite">The Beachfront Royal Suite</option>
                    <option value="garden-villa">The Beachfront Garden Villa</option>
                    <option value="lagoon-suite">The Oceanview Lagoon Suite</option>
                  </select>
                </div>

                {/* Transit addons */}
                <div className="space-y-2">
                  <label htmlFor="addonSelect" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                    Resort & Transit Addons
                  </label>
                  <select
                    id="addonSelect"
                    value={addon}
                    onChange={(e) => setAddon(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Private Airport Shuttle Only">Private Airport Shuttle Only</option>
                    <option value="Beachfront Cabana Package">Beachfront Cabana Package</option>
                    <option value="All-Inclusive VIP Beach Club Access">All-Inclusive VIP Beach Club Access</option>
                    <option value="None">No Transit Assistance Needed</option>
                  </select>
                </div>

                {/* Duration of Stay */}
                <div className="space-y-2">
                  <label htmlFor="duration" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                    Duration of Resort Stay
                  </label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="3 Nights">3 Nights (Weekend Rest)</option>
                    <option value="7 Nights">7 Nights (Full Retreat)</option>
                    <option value="14+ Nights">14+ Nights (Extended Getaway)</option>
                  </select>
                </div>

                {/* Curation tier */}
                <div className="space-y-2">
                  <label htmlFor="securityTier" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                    Guest Curation Level Needed
                  </label>
                  <select
                    id="securityTier"
                    value={securityTier}
                    onChange={(e) => setSecurityTier(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Standard Resort Guest">Standard Resort Guest</option>
                    <option value="VIP Beach Club Access">VIP Beach Club Access</option>
                    <option value="Presidential All-Inclusive Access">Presidential All-Inclusive Access</option>
                  </select>
                </div>
              </div>

              {/* Custom Request Text */}
              <div className="space-y-2">
                <label htmlFor="customRequests" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                  Personal Curation Requests / Dietaries
                </label>
                <textarea
                  id="customRequests"
                  rows={3}
                  value={customRequests}
                  onChange={(e) => setCustomRequests(e.target.value)}
                  placeholder="Specify dining desires, private cabana requests, or bespoke room arrangements..."
                  className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all placeholder:text-luxury-cream/35"
                ></textarea>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 text-xs text-luxury-cream/50 pt-2 select-none">
                <input
                  type="checkbox"
                  id="termsCheck"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="accent-luxury-gold mt-1 cursor-pointer"
                />
                <label htmlFor="termsCheck" className="cursor-pointer">
                  I certify that the information provided is correct. I authorize Ocean Hill Resort guest relation services to contact me directly for stay curation.
                </label>
              </div>

              {/* Dispatch Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-gradient text-luxury-obsidian font-bold text-xs uppercase tracking-[0.25em] py-4.5 rounded-xl shadow-2xl transition-all duration-300 hover:brightness-110 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i> Dispatching Inquiry Dossier...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-file-signature"></i> Dispatch VIP Invitation Request
                  </>
                )}
              </button>
            </form>

            {/* Success state receipt overlay */}
            {successData && (
              <div className="absolute inset-0 bg-luxury-obsidian/95 flex flex-col items-center justify-center p-8 text-center space-y-6 z-20 animate-fade-in-up">
                <div className="w-20 h-20 rounded-full bg-luxury-gold/10 border border-luxury-gold flex items-center justify-center text-luxury-gold text-4xl animate-bounce">
                  <i className="fa-solid fa-paper-plane"></i>
                </div>
                <h3 className="font-serif text-3xl text-luxury-cream">Dispatch Successful</h3>
                <p className="text-luxury-cream/80 text-sm max-w-md leading-relaxed">
                  Thank you, <strong>{successData.guestName}</strong>. Your inquiry dossier has been transferred securely via encrypted protocols to our private vetting panel. Expect correspondence at <strong>{email}</strong> inside the hour.
                </p>
                <div className="p-4 bg-luxury-charcoal rounded-xl border border-luxury-gold/20 text-left w-full max-w-sm">
                  <h5 className="font-bold text-[10px] tracking-widest text-luxury-gold uppercase mb-2">Resort Itinerary Voucher:</h5>
                  <div className="text-[11px] space-y-1 text-luxury-cream/80">
                    <div>
                      <strong className="text-luxury-cream">Booking Reference:</strong> <span className="font-mono text-luxury-gold">{successData.reference}</span>
                    </div>
                    <div>
                      <strong className="text-luxury-cream">Suite/Villa:</strong> <span>{successData.roomName}</span>
                    </div>
                    <div>
                      <strong className="text-luxury-cream">Assigned Concierge:</strong> <span className="text-luxury-lightGold">Elena Vance</span>
                    </div>
                    <div>
                      <strong className="text-luxury-cream">Curation Level:</strong> <span>{securityTier}</span>
                    </div>
                    <div>
                      <strong className="text-luxury-cream">Total calculated:</strong> <span>₱{successData.totalPrice.toLocaleString()} ({successData.nights} Nights)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSuccessData(null)
                    setFullName("")
                    setEmail("")
                    setPhone("")
                    setCustomRequests("")
                    setTermsAccepted(false)
                  }}
                  className="border border-luxury-gold/60 text-luxury-cream font-bold text-[10px] tracking-widest uppercase px-6 py-2.5 rounded-full hover:bg-luxury-gold/10 transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-luxury-obsidian border-t border-luxury-gold/15 py-16 px-6 md:px-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-luxury-gold" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                  <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" strokeWidth="2" />
                  <circle cx="50" cy="48" r="8" fill="#D4AF37" />
                </svg>
                <span className="font-serif text-lg tracking-[0.2em] text-luxury-cream uppercase font-semibold">
                  Ocean <span className="text-luxury-gold">Hill</span>
                </span>
              </div>
              <p className="text-luxury-cream/50 text-xs leading-relaxed max-w-xs">
                Representing the finest beachfront resort suites, private sandy bays, and exclusive retreat properties globally. Crafted with golden luxury and premium hospitality.
              </p>
              <div className="flex gap-4 text-luxury-gold text-lg">
                <a href="#" className="hover:text-luxury-cream transition-colors">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" className="hover:text-luxury-cream transition-colors">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="#" className="hover:text-luxury-cream transition-colors">
                  <i className="fa-brands fa-youtube"></i>
                </a>
                <a href="#" className="hover:text-luxury-cream transition-colors">
                  <i className="fa-brands fa-pinterest"></i>
                </a>
              </div>
            </div>

            {/* exploration */}
            <div className="space-y-4">
              <h4 className="font-serif text-luxury-cream tracking-widest uppercase text-xs font-bold">The Portfolio</h4>
              <ul className="space-y-2 text-xs text-luxury-cream/60">
                <li>
                  <a href="#about" className="hover:text-luxury-gold transition-colors">Resort Story</a>
                </li>
                <li>
                  <a href="#villas" className="hover:text-luxury-gold transition-colors">Suites & Villas</a>
                </li>
                <li>
                  <a href="#amenities" className="hover:text-luxury-gold transition-colors">Amenities</a>
                </li>
                <li>
                  <a href="#campaign" className="hover:text-luxury-gold transition-colors">Cinematic Showcase</a>
                </li>
              </ul>
            </div>

            {/* locations */}
            <div className="space-y-4">
              <h4 className="font-serif text-luxury-cream tracking-widest uppercase text-xs font-bold">Resorts & Terraces</h4>
              <ul className="space-y-2 text-xs text-luxury-cream/60">
                <li>Mykonos, Greece</li>
                <li>Amalfi Coast, Italy</li>
                <li>Monaco Harbor Terraces</li>
                <li>Riviera Golden Heights</li>
              </ul>
            </div>

            {/* Secure channels */}
            <div className="space-y-4">
              <h4 className="font-serif text-luxury-cream tracking-widest uppercase text-xs font-bold">Guest Relations Office</h4>
              <div className="text-xs text-luxury-cream/60 space-y-2">
                <p>
                  <i className="fa-solid fa-envelope text-luxury-gold mr-1"></i> relations@oceanhillresort.com
                </p>
                <p>
                  <i className="fa-solid fa-phone-volume text-luxury-gold mr-1"></i> +30 210 555 9821
                </p>
                <p className="text-[10px] text-luxury-gold uppercase tracking-[0.2em] font-semibold mt-4">
                  <i className="fa-solid fa-headset"></i> 24/7 Dedicated Guest Relations
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-luxury-gold/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-luxury-cream/40">
            <span>&copy; {new Date().getFullYear()} Ocean Hill Resort Group S.A. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-luxury-gold">Privacy Directives</a>
              <a href="#" className="hover:text-luxury-gold">VIP Disclosures</a>
              <a href="#" className="hover:text-luxury-gold">Lobbyists Registration</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Existing Booking Modal Integration */}
      <BookingModal room={selectedRoom} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
