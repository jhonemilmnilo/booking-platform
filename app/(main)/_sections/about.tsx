"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin, Loader2 } from "lucide-react"

const GALLERY_ITEMS = [
  {
    id: "pool",
    name: "Infinity Ocean Pool",
    description: "Our signature heated overwater lagoon pool offering direct panoramic vistas of the Aegean shoreline waves.",
    imageUrl: "/images/image6.png",
    location: "West Wing Beachfront",
  },
  {
    id: "lounge",
    name: "Luxury Sea Lounge",
    description: "Handcrafted marble bars, glass flooring, and premium vintage lounges overlooking private yacht arrivals.",
    imageUrl: "/images/image4.png",
    location: "East Wing Club House",
  },
  {
    id: "balcony",
    name: "Royal Suite Balcony",
    description: "Enjoy sunset champagne service directly on your custom white-sand balcony deck.",
    imageUrl: "/images/image3.png",
    location: "Royal Suite Terrace",
  },
  {
    id: "vista",
    name: "Peninsula Aerial Vista",
    description: "A breathtaking drone look at our completely secluded white-sand peninsula and private coral reefs.",
    imageUrl: "/images/image5.png",
    location: "Sanctuary Cove Heights",
  },
  {
    id: "guest-wing",
    name: "Oceanfront Guest Wing",
    description: "Sprawling private terraces directly overlooking the resort's private yacht harbor and sailing docks.",
    imageUrl: "/images/image7.webp",
    location: "South Shore Wing",
  },
]

export default function About() {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  // Auto-cycle active gallery spotlight every 5 seconds
  React.useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % GALLERY_ITEMS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <section id="about" className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-obsidian to-luxury-charcoal relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-16 items-center">
        {/* Spotlight Masonry Gallery (Based on EMapandan logic) */}
        <div 
          className="relative grid grid-cols-6 md:grid-cols-12 gap-4 grid-flow-dense w-full h-[380px] md:h-[580px] select-none order-2 lg:order-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {GALLERY_ITEMS.map((item, idx) => {
            const isActive = activeIndex === idx
            return (
              <GalleryCard
                key={item.id}
                item={item}
                isActive={isActive}
                activeIndex={activeIndex}
                onClick={() => setActiveIndex(idx)}
              />
            )
          })}

        </div>

        {/* Content Section */}
        <div className="space-y-6 lg:pl-6 gsap-reveal-fade-up order-1 lg:order-2">
          <div className="space-y-3">
            <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Resort Walkthrough</span>
            <h2 className="font-serif text-3xl md:text-5xl text-luxury-cream leading-tight">
              Experience the <br />
              <span className="text-gold-gradient italic">Sanctuary Tour</span>
            </h2>
          </div>

          <p className="text-luxury-cream/70 leading-relaxed font-light text-base md:text-lg">
            Embark on a sensory virtual journey through our private shoreline. Click any spotlight panel in our interactive gallery to tour our private overwater lagoons, luxury suites, and panoramic ocean vistas.
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                const villasSection = document.getElementById("villas")
                if (villasSection) {
                  villasSection.scrollIntoView({ behavior: "smooth" })
                }
              }}
              className="hidden lg:flex w-full sm:w-auto min-w-[240px] bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-bold text-xs uppercase tracking-[0.2em] py-4 px-8 rounded-full shadow-lg active:scale-98 transition-all items-center justify-center gap-2 cursor-pointer border-none"
            >
              Explore More <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-only Explore More button at the very bottom */}
      <div className="mt-8 flex justify-center lg:hidden w-full px-6">
        <button
          onClick={() => {
            const villasSection = document.getElementById("villas")
            if (villasSection) {
              villasSection.scrollIntoView({ behavior: "smooth" })
            }
          }}
          className="w-full sm:w-auto min-w-[240px] bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-bold text-xs uppercase tracking-[0.2em] py-4 px-8 rounded-full shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
        >
          Explore More <i className="fa-solid fa-arrow-right text-xs"></i>
        </button>
      </div>
    </section>
  )
}

interface GalleryCardProps {
  item: typeof GALLERY_ITEMS[0]
  isActive: boolean
  activeIndex: number
  onClick: () => void
}

function GalleryCard({ item, isActive, activeIndex, onClick }: GalleryCardProps) {
  const [isImageLoading, setIsImageLoading] = React.useState(true)

  // Dynamically set sizing and positioning classes depending on active state
  const colSpanClass = isActive 
    ? "col-span-4 md:col-span-8 h-[180px] md:h-[280px]" 
    : "col-span-2 md:col-span-4 h-[180px] md:h-[280px]"

  return (
    <motion.div
      layout
      onClick={onClick}
      initial={false}
      animate={{
        filter: isActive ? "grayscale(0) brightness(1)" : "grayscale(0.3) brightness(0.65)"
      }}
      transition={{
        duration: 0.6,
        ease: "anticipate"
      }}
      className={`group relative rounded-xl md:rounded-3xl overflow-hidden border border-luxury-gold/15 bg-luxury-obsidian cursor-pointer shadow-lg transition-all duration-700 flex flex-col justify-end ${colSpanClass}`}
    >
      {/* Loader spinner */}
      <div className={`absolute inset-0 z-10 flex items-center justify-center bg-luxury-obsidian transition-opacity duration-700 ${isImageLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Loader2 className="w-6 h-6 text-luxury-gold animate-spin" />
      </div>

      {/* Main Image */}
      <Image
        src={item.imageUrl}
        alt={item.name}
        fill
        loading="lazy"
        onLoad={() => setIsImageLoading(false)}
        className={`object-cover transition-all duration-1000 ${isActive ? "scale-105" : "scale-110 group-hover:scale-105"}`}
      />

      {/* Gradients overlays */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${
        isActive ? "bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-100" : "bg-black/40 opacity-100"
      }`} />

      {/* Info details overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-20 space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-serif text-white font-semibold tracking-wide truncate text-xs md:text-sm">
              {item.name}
            </h4>
            <p className="text-luxury-gold text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{item.location}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Animated active progress bar */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-luxury-gold z-30"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          key={`progress-${activeIndex}`}
        />
      )}
    </motion.div>
  )
}
