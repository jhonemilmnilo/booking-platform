"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

import { getSystemSettingsAction } from "@/app/auth/actions"
import { getClientCachedSettings, setClientCachedSettings } from "@/lib/client-cache"

export interface AmenityItem {
  id: string
  title: string
  subtitle: string
  description: string
  category: "all" | "beach" | "wellness" | "dining" | string
  categoryLabel: string
  icon: string
  hours: string
  perks: string[]
  highlightBadge?: string
}

export const AMENITIES_DATA: AmenityItem[] = [
  {
    id: "beach-club",
    title: "Private Beach Club",
    subtitle: "Pristine Sands & Daybeds",
    description: "Enjoy exclusive access to our secluded white sand cove, fully serviced with luxury loungers, double daybeds, and dedicated beachside concierges.",
    category: "beach",
    categoryLabel: "Beachfront",
    icon: "fa-umbrella-beach",
    hours: "6:00 AM – 7:00 PM",
    perks: ["Private Cove", "Double Daybeds", "Butler Service"],
    highlightBadge: "Signature",
  },
  {
    id: "water-sports",
    title: "Water Sports & Charters",
    subtitle: "Coastal Exploration",
    description: "Paddleboards, sea kayaks, and custom luxury yacht charters are available directly from the private resort pier for bespoke ocean exploration.",
    category: "beach",
    categoryLabel: "Sea Adventures",
    icon: "fa-ship",
    hours: "8:00 AM – 5:00 PM",
    perks: ["Private Yachts", "Sea Kayaks", "Guided Reef Tours"],
  },
  {
    id: "fine-dining",
    title: "Fine Oceanfront Dining",
    subtitle: "Mediterranean Gastronomy",
    description: "Indulge in gourmet Mediterranean cuisine crafted from locally sourced coastal ingredients, served directly over the water under the evening stars.",
    category: "dining",
    categoryLabel: "Gourmet Dining",
    icon: "fa-utensils",
    hours: "11:30 AM – 11:00 PM",
    perks: ["Michelin-Caliber Chefs", "Overwater Deck", "Private Cellar"],
    highlightBadge: "Award Winning",
  },
  {
    id: "poolside-loungers",
    title: "Poolside Loungers & Cabanas",
    subtitle: "Lagoon & Infinity Terraces",
    description: "Relax beside our multi-tiered heated lagoon and infinity pools, featuring shaded luxury cabanas, chilled towel service, and panoramic ocean vistas.",
    category: "wellness",
    categoryLabel: "Relaxation",
    icon: "fa-water",
    hours: "7:00 AM – 10:00 PM",
    perks: ["Infinity Edge", "Heated Waters", "Chilled Towels"],
  },
  {
    id: "wellness-spa",
    title: "Wellness & Spa Pavilion",
    subtitle: "Holistic Rejuvenation",
    description: "Experience world-class massage therapy, Himalayan salt saunas, and sensory wellness treatments designed to restore body and mind right on the shore.",
    category: "wellness",
    categoryLabel: "Holistic Health",
    icon: "fa-spa",
    hours: "9:00 AM – 9:00 PM",
    perks: ["Herbal Steam", "Deep Tissue Massage", "Sound Healing"],
    highlightBadge: "Holistic",
  },
  {
    id: "sunset-bar",
    title: "Sunset Cabana Bar",
    subtitle: "Artisanal Libations",
    description: "Sip custom botanical cocktails, fresh cold-pressed tropical juices, and vintage reserve wines served directly to your lounge chair by master mixologists.",
    category: "dining",
    categoryLabel: "Seaside Drinks",
    icon: "fa-martini-glass-citrus",
    hours: "3:00 PM – Midnight",
    perks: ["Master Mixology", "Craft Botanical Cocktails", "Sunset DJ Sets"],
  },
]

export default function Amenities() {
  const [amenitiesList, setAmenitiesList] = React.useState<AmenityItem[]>(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.resortAmenities) {
        try {
          const parsed = JSON.parse(c.resortAmenities)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } catch {}
      }
    }
    return AMENITIES_DATA
  })

  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)
  const [activeIndex, setActiveIndex] = React.useState(0)

  // Hydrate fresh data from system settings
  React.useEffect(() => {
    let isMounted = true
    getSystemSettingsAction()
      .then((settings) => {
        if (!isMounted) return
        if (settings.resortAmenities) {
          try {
            const parsed = JSON.parse(settings.resortAmenities)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAmenitiesList(parsed)
              const cur = getClientCachedSettings() || {}
              setClientCachedSettings({
                ...cur,
                resortAmenities: settings.resortAmenities,
              })
            }
          } catch {}
        }
      })
      .catch((err) => {
        console.error("[Amenities] Background fetch failed:", err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredAmenities = React.useMemo(() => {
    if (activeCategory === "all") return amenitiesList
    return amenitiesList.filter((a) => a.category === activeCategory)
  }, [activeCategory, amenitiesList])

  // Check scroll position for controls and dots
  const checkScrollState = React.useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 20)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20)

    // Calculate active card index based on scroll position
    const cardWidth = 340 + 24
    const idx = Math.min(
      Math.max(0, Math.round(scrollLeft / cardWidth)),
      filteredAmenities.length - 1
    )
    setActiveIndex(idx)
  }, [filteredAmenities.length])

  React.useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    el.addEventListener("scroll", checkScrollState, { passive: true })
    checkScrollState()
    return () => el.removeEventListener("scroll", checkScrollState)
  }, [checkScrollState])

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollContainerRef.current
    if (!el) return
    const amount = direction === "left" ? -380 : 380
    el.scrollBy({ left: amount, behavior: "smooth" })
  }

  const scrollToCard = (index: number) => {
    const el = scrollContainerRef.current
    if (!el) return
    const card = el.children[index] as HTMLElement
    if (card) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }
  }

  return (
    <section
      id="amenities"
      className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-obsidian via-luxury-charcoal/40 to-luxury-obsidian text-luxury-cream relative overflow-hidden"
    >
      {/* Subtle ambient light glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-luxury-gold/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-luxury-gold/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block mb-3">
              Tailored Lifestyles &bull; Curated Privileges
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl text-luxury-cream tracking-wide leading-tight">
              Your Absolute{" "}
              <span className="bg-clip-text text-transparent text-gold-gradient italic">
                Prerogative
              </span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-luxury-cream/70 text-sm md:text-base leading-relaxed font-light"
          >
            Every detail of your stay is curated by certified luxury hospitality concierges, matching standard European royal protocols and personalized coastal indulgences.
          </motion.p>
        </div>

        {/* Filter Pills & Interactive Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-luxury-gold/15 pb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar p-1">
            {[
              { id: "all", label: "All Privileges", count: amenitiesList.length },
              { id: "beach", label: "Beach & Sea", count: amenitiesList.filter((a) => a.category === "beach").length },
              { id: "wellness", label: "Wellness & Pools", count: amenitiesList.filter((a) => a.category === "wellness").length },
              { id: "dining", label: "Gourmet & Libations", count: amenitiesList.filter((a) => a.category === "dining").length },
            ].map((tab) => {
              const isSelected = activeCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? "bg-luxury-gold text-white shadow-lg shadow-luxury-gold/25 scale-[1.02]"
                      : "text-luxury-cream/70 hover:text-luxury-cream bg-white hover:bg-white/80 border border-luxury-gold/20 shadow-sm"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected ? "bg-black/20 text-white font-bold" : "bg-black/5 text-luxury-cream/60"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Reel Nav Controls (Desktop & Tablet) */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-luxury-cream/50 uppercase tracking-widest hidden lg:inline font-medium">
              Explore Amenities
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                disabled={!canScrollLeft}
                aria-label="Previous amenities"
                className="w-10 h-10 rounded-xl bg-white hover:bg-luxury-gold text-luxury-cream hover:text-white border border-luxury-gold/25 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i>
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                disabled={!canScrollRight}
                aria-label="Next amenities"
                className="w-10 h-10 rounded-xl bg-white hover:bg-luxury-gold text-luxury-cream hover:text-white border border-luxury-gold/25 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* ── Responsive Amenities Display ──────────────────────────────────── */}
        {/* Horizontal Smooth Snap Reel on Mobile / Tablet, Balanced Grid on Large Screens */}
        <div
          ref={scrollContainerRef}
          className="flex lg:grid lg:grid-cols-3 gap-6 sm:gap-8 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scroll-smooth no-scrollbar pb-6 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0"
        >
          <AnimatePresence mode="popLayout">
            {filteredAmenities.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: Math.min(index * 0.08, 0.3),
                }}
                className="group relative bg-white/80 hover:bg-white border border-luxury-gold/20 hover:border-luxury-gold/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(212,175,55,0.14)] hover:-translate-y-1.5 overflow-hidden w-[85vw] sm:w-[360px] lg:w-auto shrink-0 snap-center"
              >
                {/* Ambient Decorative Shimmer */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-luxury-gold/10 via-transparent to-transparent rounded-bl-full pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-100" />

                {/* Subtle Background Watermark Icon */}
                <div className="absolute -bottom-6 -right-6 text-luxury-gold/[0.04] group-hover:text-luxury-gold/[0.08] text-9xl pointer-events-none transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-6">
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>

                <div className="space-y-6 relative z-10">
                  {/* Top Header Row with Icon and Badges */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold text-2xl group-hover:bg-luxury-gold group-hover:text-white transition-all duration-500 shadow-sm group-hover:scale-105">
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {item.highlightBadge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-luxury-gold text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                          {item.highlightBadge}
                        </span>
                      )}
                      <span className="text-[10px] tracking-widest text-luxury-gold uppercase font-semibold">
                        {item.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Title & Narrative */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl sm:text-2xl text-luxury-cream font-medium group-hover:text-luxury-gold transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-luxury-gold font-medium uppercase tracking-wider">
                      {item.subtitle}
                    </p>
                    <p className="text-luxury-cream/70 text-xs sm:text-sm leading-relaxed font-light pt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlight Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {item.perks.map((perk, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2.5 py-1 rounded-lg bg-luxury-charcoal border border-luxury-gold/15 text-[10px] text-luxury-cream/80 font-medium"
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Operating Hours & Micro-Action */}
                <div className="pt-6 mt-6 border-t border-luxury-gold/15 flex items-center justify-between text-xs relative z-10">
                  <div className="flex items-center gap-1.5 text-luxury-cream/60 text-[11px]">
                    <i className="fa-regular fa-clock text-luxury-gold text-[10px]"></i>
                    <span>{item.hours}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-luxury-gold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-300">
                    <span>Privilege</span>
                    <i className="fa-solid fa-chevron-right text-[9px]"></i>
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile Swipe Indicators & Pagination Dots */}
        <div className="flex flex-col items-center gap-3 lg:hidden pt-2">
          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {filteredAmenities.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => scrollToCard(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === dotIdx
                    ? "w-7 h-2 bg-luxury-gold shadow-sm"
                    : "w-2 h-2 bg-black/15 hover:bg-black/30"
                }`}
              />
            ))}
          </div>

          {/* Swipe Hint */}
          <p className="text-[10px] text-luxury-cream/50 uppercase tracking-widest flex items-center gap-1.5 font-medium">
            <i className="fa-solid fa-arrows-left-right text-[10px] text-luxury-gold"></i>
            Swipe to explore all privileges
          </p>
        </div>
      </div>
    </section>
  )
}
