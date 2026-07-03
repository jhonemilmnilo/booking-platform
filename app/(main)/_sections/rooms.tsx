"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Room } from "@/components/shared/RoomCard"

interface RoomsProps {
  mockRooms: Room[];
  onBookClick: (room: Room) => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
    opacity: 0
  })
}

export default function Rooms({ mockRooms, onBookClick }: RoomsProps) {
  const [activeSuiteIndex, setActiveSuiteIndex] = React.useState(0)
  const [slideDirection, setSlideDirection] = React.useState(0)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const activeSuite = mockRooms[activeSuiteIndex]

  const nextSuite = () => {
    setSlideDirection(1)
    setActiveSuiteIndex((prev) => (prev + 1) % mockRooms.length)
  }

  const prevSuite = () => {
    setSlideDirection(-1)
    setActiveSuiteIndex((prev) => (prev - 1 + mockRooms.length) % mockRooms.length)
  }

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("pool")) return "fa-droplet"
    if (lower.includes("breakfast") || lower.includes("wine")) return "fa-wine-glass"
    if (lower.includes("kitchen") || lower.includes("cook")) return "fa-kitchen-set"
    if (lower.includes("air")) return "fa-wind"
    if (lower.includes("pet")) return "fa-dog"
    if (lower.includes("tv") || lower.includes("television")) return "fa-tv"
    if (lower.includes("linen") || lower.includes("towel")) return "fa-shirt"
    if (lower.includes("concierge")) return "fa-bell-concierge"
    if (lower.includes("key")) return "fa-key"
    return "fa-spa"
  }

  const displayedAmenities = React.useMemo(() => {
    if (!activeSuite?.amenities) return []
    return isMobile ? activeSuite.amenities.slice(0, 4) : activeSuite.amenities
  }, [activeSuite, isMobile])

  return (
    <section id="villas" className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-charcoal to-luxury-obsidian relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 gsap-reveal-fade-up">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch gsap-reveal-fade-up">
          {/* Details Box Column Wrapper (Static) */}
          <div className="lg:col-span-5 relative h-[520px] sm:h-[500px] lg:h-[500px] w-full">
            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
              <motion.div
                key={activeSuiteIndex}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.5, ease: "easeOut" },
                  opacity: { duration: 0.35 }
                }}
                className="absolute inset-0 flex flex-col justify-between bg-luxury-obsidian/80 border border-luxury-gold/30 rounded-3xl p-6 sm:p-8 md:p-10 gold-glow overflow-hidden h-full w-full"
              >
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-luxury-gold/5 rounded-full blur-2xl"></div>

                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-luxury-gold/10 pb-4 gap-2">
                    <span className="text-luxury-gold font-bold uppercase tracking-[0.25em] text-[10px] sm:text-xs">
                      {activeSuiteIndex === 0 ? "Oceanfront Club Wing" : activeSuiteIndex === 1 ? "West Beach Shoreline" : "East Lagoon Gardens"}
                    </span>
                    <span className="font-serif text-base sm:text-lg text-luxury-cream font-semibold whitespace-nowrap">
                      ₱{activeSuite.pricePerNight.toLocaleString()}{" "}
                      <span className="text-[10px] font-sans text-luxury-cream/50 uppercase tracking-widest">/ Night</span>
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-luxury-cream font-bold">{activeSuite.name}</h3>
                    <p className="text-luxury-cream/70 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">{activeSuite.description}</p>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2 pt-2 md:pt-4">
                    <span className="text-luxury-gold font-semibold uppercase text-[10px] tracking-widest block">Suite Amenities</span>
                    <ul className="grid grid-cols-2 gap-2 md:gap-3 text-xs text-luxury-cream/90">
                      {displayedAmenities.map((amenity, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <i className={`fa-solid text-luxury-gold ${getAmenityIcon(amenity)}`}></i>
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Dot Indicators & CTA */}
                <div className="mt-4 md:mt-10 pt-4 md:pt-6 border-t border-luxury-gold/10 flex flex-col sm:flex-row gap-4 justify-between items-center z-10">
                  <div className="flex gap-2">
                    {mockRooms.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (i !== activeSuiteIndex) {
                            setSlideDirection(i > activeSuiteIndex ? 1 : -1)
                            setActiveSuiteIndex(i)
                          }
                        }}
                        className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === activeSuiteIndex ? "w-6 bg-luxury-gold" : "w-2.5 bg-luxury-gold/20"
                          }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => onBookClick(activeSuite)}
                    className="w-full sm:w-auto text-center bg-gold-gradient text-luxury-obsidian font-bold text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow transition-all duration-300 hover:scale-102 cursor-pointer"
                  >
                    Configure Itinerary
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Display Showcase Column Wrapper (Static) */}
          <div className="lg:col-span-7 relative h-[450px] lg:h-[500px] w-full">
            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
              <motion.div
                key={activeSuiteIndex}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.5, ease: "easeOut" },
                  opacity: { duration: 0.35 }
                }}
                className="absolute inset-0 rounded-3xl overflow-hidden border border-luxury-gold/20 bg-luxury-obsidian w-full h-full"
              >
                <Image src={activeSuite.imageUrl} alt={activeSuite.name} fill className="object-cover" priority />

                {/* Overlay with navigation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-6 z-10">
                  <div className="self-end bg-luxury-obsidian/95 border border-luxury-gold/30 px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-semibold text-luxury-cream shadow-md">
                    <i className="fa-regular fa-eye text-luxury-gold mr-1"></i> Virtual Tour Enabled
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevSuite}
                      className="w-12 h-12 rounded-full bg-luxury-obsidian/95 hover:bg-luxury-gold text-luxury-cream border border-luxury-gold/20 flex items-center justify-center transition-all duration-300 transform hover:-translate-x-1 cursor-pointer shadow-md"
                      aria-label="Previous Suite"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={nextSuite}
                      className="w-12 h-12 rounded-full bg-luxury-obsidian/95 hover:bg-luxury-gold text-luxury-cream border border-luxury-gold/20 flex items-center justify-center transition-all duration-300 transform hover:translate-x-1 cursor-pointer shadow-md"
                      aria-label="Next Suite"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>

                  <div className="flex justify-around items-center gap-4 text-xs text-luxury-cream bg-luxury-obsidian/95 border border-luxury-gold/20 rounded-xl py-3 px-6 shadow-lg select-none">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <i className="fa-solid fa-panorama text-luxury-gold flex-shrink-0"></i>{" "}
                      {activeSuiteIndex === 0
                        ? "180° Aegean Views"
                        : activeSuiteIndex === 1
                          ? "Unobstructed Sunsets"
                          : "Lagoon & Coral Views"}
                    </span>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <i className="fa-solid fa-user-group text-luxury-gold flex-shrink-0"></i> Up to {activeSuite.capacity} VIPs
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
