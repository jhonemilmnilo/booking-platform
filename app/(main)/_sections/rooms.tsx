"use client"

import * as React from "react"
import Link from "next/link"
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

  const suiteGallery = React.useMemo(() => {
    const list: string[] = []
    if (activeSuite?.imageUrl) list.push(activeSuite.imageUrl)
    if (activeSuite?.images && Array.isArray(activeSuite.images)) {
      for (const img of activeSuite.images) {
        if (img && !list.includes(img)) list.push(img)
      }
    }
    return list.length > 0 ? list : ["/images/image7.webp"]
  }, [activeSuite])

  const [activeGalleryIndex, setActiveGalleryIndex] = React.useState(0)
  const [galleryDirection, setGalleryDirection] = React.useState(0)
  const [isGalleryPaused, setIsGalleryPaused] = React.useState(false)

  // Reset gallery to photo 0 whenever the active suite changes
  React.useEffect(() => {
    setActiveGalleryIndex(0)
    setGalleryDirection(0)
  }, [activeSuiteIndex])

  // Automatically slide through gallery photos every 4.5 seconds
  React.useEffect(() => {
    if (suiteGallery.length <= 1 || isGalleryPaused) return

    const timer = setInterval(() => {
      setGalleryDirection(1)
      setActiveGalleryIndex((prev) => (prev + 1) % suiteGallery.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [suiteGallery.length, isGalleryPaused])

  const nextGalleryImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setGalleryDirection(1)
    setActiveGalleryIndex((prev) => (prev + 1) % suiteGallery.length)
  }

  const prevGalleryImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setGalleryDirection(-1)
    setActiveGalleryIndex((prev) => (prev - 1 + suiteGallery.length) % suiteGallery.length)
  }

  return (
    <section id="villas" className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-charcoal to-luxury-obsidian relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 gsap-reveal-fade-up">
          <div className="space-y-4">
            <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Select Your Domain</span>
            <h2 className="font-serif text-4xl md:text-6xl text-luxury-cream">
              The Luxury <span className="bg-clip-text text-transparent text-gold-gradient italic">Suites & Villas</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 max-w-md">
            <p className="text-luxury-cream/70 text-xs sm:text-sm leading-relaxed text-left md:text-right">
              Select from our curated beachfront villas and oceanfront suites, each offering direct access to the warm sands and private infinity pools.
            </p>
            <Link
              href="/villas"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gold-gradient hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-luxury-gold/20 hover:shadow-luxury-gold/35 transition-all duration-300 cursor-pointer"
            >
              <span>See More Suites</span>
              <i className="fa-solid fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1"></i>
            </Link>
          </div>
        </div>

        {/* Suite Showcase interface */}
        <div className="relative gsap-reveal-fade-up">
          {/* Action Navigation Buttons - Flanking the entire showcase to change suites */}
          <button
            type="button"
            onClick={prevSuite}
            className="absolute -left-4 sm:-left-5 lg:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 dark:bg-[#16171b]/95 hover:bg-luxury-gold dark:hover:bg-luxury-gold text-[#1C1A17] dark:text-luxury-cream hover:text-white dark:hover:text-white border border-black/10 dark:border-luxury-gold/30 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xl z-30 backdrop-blur-sm"
            aria-label="Previous Suite"
            title="Previous Suite"
          >
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>

          <button
            type="button"
            onClick={nextSuite}
            className="absolute -right-4 sm:-right-5 lg:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 dark:bg-[#16171b]/95 hover:bg-luxury-gold dark:hover:bg-luxury-gold text-[#1C1A17] dark:text-luxury-cream hover:text-white dark:hover:text-white border border-black/10 dark:border-luxury-gold/30 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xl z-30 backdrop-blur-sm"
            aria-label="Next Suite"
            title="Next Suite"
          >
            <i className="fa-solid fa-chevron-right text-sm"></i>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
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
                    className="w-full sm:w-auto text-center bg-gold-gradient text-white font-bold text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow transition-all duration-300 hover:scale-102 cursor-pointer"
                  >
                    Configure Itinerary
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Display Showcase Column Wrapper: Slidable Suite Gallery */}
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
                onMouseEnter={() => setIsGalleryPaused(true)}
                onMouseLeave={() => setIsGalleryPaused(false)}
                onTouchStart={() => setIsGalleryPaused(true)}
                onTouchEnd={() => setIsGalleryPaused(false)}
                className="absolute inset-0 rounded-3xl overflow-hidden border border-luxury-gold/20 bg-luxury-obsidian w-full h-full group"
              >
                {/* Slidable Photo with Framer Motion slide & drag */}
                <div className="relative w-full h-full overflow-hidden select-none">
                  <AnimatePresence initial={false} custom={galleryDirection} mode="popLayout">
                    <motion.div
                      key={activeGalleryIndex}
                      custom={galleryDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "tween", duration: 0.4, ease: "easeOut" },
                        opacity: { duration: 0.3 }
                      }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -35) {
                          nextGalleryImage()
                        } else if (info.offset.x > 35) {
                          prevGalleryImage()
                        }
                      }}
                      className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
                    >
                      <Image
                        src={suiteGallery[activeGalleryIndex] || activeSuite.imageUrl}
                        alt={`${activeSuite.name} Photo ${activeGalleryIndex + 1}`}
                        fill
                        className="object-cover pointer-events-none"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Overlay elements with navigation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 flex flex-col justify-between p-6 pointer-events-none z-10">
                  {/* Top Bar: Gallery Counter & Virtual Tour */}
                  <div className="flex items-center justify-between w-full pointer-events-auto">
                    {suiteGallery.length > 1 ? (
                      <div className="bg-luxury-obsidian/90 backdrop-blur-md border border-luxury-gold/30 px-3.5 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-semibold text-luxury-cream shadow-md flex items-center gap-1.5">
                        <i className="fa-solid fa-camera text-luxury-gold text-[10px]"></i>
                        <span>Photo {activeGalleryIndex + 1} of {suiteGallery.length}</span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="bg-luxury-obsidian/95 border border-luxury-gold/30 px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-semibold text-luxury-cream shadow-md">
                      <i className="fa-regular fa-eye text-luxury-gold mr-1"></i> Virtual Tour Enabled
                    </div>
                  </div>

                  {/* Bottom: Gallery Indicators & Specs Bar */}
                  <div className="space-y-3 w-full pointer-events-auto">
                    {/* Gallery Dot Indicators */}
                    {suiteGallery.length > 1 && (
                      <div className="flex items-center justify-center gap-1.5">
                        {suiteGallery.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setGalleryDirection(idx > activeGalleryIndex ? 1 : -1)
                              setActiveGalleryIndex(idx)
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === activeGalleryIndex
                                ? "w-6 bg-luxury-gold shadow-md"
                                : "w-2 bg-white/40 hover:bg-white/80"
                            }`}
                            aria-label={`Go to photo ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Room Specs Bar */}
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
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      </div>
    </section>
  )
}
