"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const VILLAS = [
  {
    id: "ocean-pearl",
    name: "Ocean Pearl Suite",
    location: "West Wing Beachfront",
    videoUrl: "/videos/enhance_ocean_hill_villas.mp4",
    description: "The crown jewel of our oceanfront collection. Perched directly above the private lagoon, the Ocean Pearl Suite offers unobstructed 270° sea views, a private heated plunge pool on the terrace, and a personal butler on call around the clock.",
  },
  {
    id: "sapphire-cove",
    name: "Sapphire Cove Villa",
    location: "East Wing Club House",
    videoUrl: "/videos/enhance_ocean_hill_villas_original.mp4",
    description: "A secluded masterpiece built into the natural coral ridge, offering glass-floored living spaces above a private tidal pool. The Sapphire Cove Villa merges raw nature with absolute luxury — handcrafted timber furnishings, a deep-soak marble tub, and ambient coastal soundscapes.",
  },
  {
    id: "royal-horizon",
    name: "Royal Horizon Penthouse",
    location: "Royal Suite Terrace",
    videoUrl: "/videos/enhance_ocean_hill_villas_mobile.mp4",
    description: "Our flagship penthouse, crowning the resort at the highest elevation to capture the full 360° coastal panorama. The Royal Horizon Penthouse includes a wraparound champagne terrace, sunset fire pit, an outdoor open-air shower, and exclusive early-access dining reservations.",
  },
  {
    id: "cliffside-escape",
    name: "Cliffside Escape Bungalow",
    location: "Sanctuary Cove Heights",
    videoUrl: "/videos/enhance_ocean_hill_villas.mp4",
    description: "Suspended dramatically over the natural cliff edge, the Cliffside Escape Bungalow is a statement of bold architectural luxury. Guests enjoy a private infinity pool that appears to merge seamlessly with the ocean below, suspended coral reef views, and stone pathway access to a private cove.",
  },
  {
    id: "shore-haven",
    name: "Shore Haven Retreat",
    location: "South Shore Wing",
    videoUrl: "/videos/enhance_ocean_hill_villas_original.mp4",
    description: "For those who prefer the quiet lap of the waves on soft white sand, Shore Haven sits mere steps from the water's edge. This sprawling retreat features twin en-suite bedrooms, a private courtyard garden, a personal hammock over the tidal zone, and an al fresco dining patio facing the sea.",
  },
]

export default function VillasPage() {
  const [scrollDirection, setScrollDirection] = React.useState<"up" | "down">("up")
  const [isAtTop, setIsAtTop] = React.useState(true)
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsAtTop(currentScrollY < 120)

      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current) {
          setScrollDirection("down")
        } else {
          setScrollDirection("up")
        }
      } else {
        setScrollDirection("up")
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="bg-luxury-obsidian min-h-screen text-luxury-cream pt-32 pb-24 overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-luxury-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-8">

        {/* Navigation Breadcrumbs */}
        <div className={`w-full transition-all duration-300 ${
          isAtTop
            ? "relative border-b border-luxury-gold/10 pb-6 pt-0"
            : scrollDirection === "down"
              ? "fixed top-0 left-0 w-full bg-luxury-obsidian/95 backdrop-blur-md px-6 md:px-12 py-4 border-b border-luxury-gold/15 z-40 shadow-2xl translate-y-0 opacity-100"
              : "fixed top-0 left-0 w-full bg-luxury-obsidian/95 backdrop-blur-md px-6 md:px-12 py-4 border-b border-luxury-gold/15 z-40 shadow-2xl -translate-y-full opacity-0 pointer-events-none"
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2 text-luxury-cream/50">
              <Link href="/#campaign" className="hover:text-luxury-gold transition-colors duration-300">
                Home
              </Link>
              <span className="text-luxury-gold/30">/</span>
              <span className="text-luxury-gold font-bold">Our Villas</span>
            </div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-luxury-cream/45 font-medium hidden sm:inline">
              Exclusive Villa Collection
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-luxury-gold uppercase tracking-[0.4em] text-[10px] md:text-xs font-semibold block">
            Private Sanctuaries
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-luxury-cream leading-tight">
            Discover Our <span className="text-gold-gradient italic">Villa Collection</span>
          </h1>
          <p className="text-luxury-cream/70 leading-relaxed font-light text-sm md:text-base">
            Each villa is a curated world of its own — designed to dissolve the boundary between absolute comfort and the wild beauty of the ocean.
          </p>
        </div>

        {/* Villas List */}
        <div className="space-y-24 md:space-y-36 pt-2">
          {VILLAS.map((villa, index) => {
            const isEven = index % 2 === 0
            return (
              <div
                key={villa.id}
                id={villa.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Visual Card (Alternating Layout) */}
                <div className={`lg:col-span-7 relative group rounded-3xl overflow-hidden border border-luxury-gold/15 shadow-2xl h-[300px] md:h-[480px] bg-luxury-charcoal gold-glow ${
                  isEven ? "lg:order-1" : "lg:order-2"
                }`}>
                  <video
                    src={villa.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Location badge */}
                  <div className="absolute top-4 left-4 bg-luxury-obsidian/85 border border-luxury-gold/30 h-7 px-3.5 rounded-full backdrop-blur-sm z-20 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-widest text-luxury-cream font-bold leading-none">
                      {villa.location}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className={`lg:col-span-5 space-y-6 ${
                  isEven ? "lg:order-2 lg:pl-8" : "lg:order-1 lg:pr-8"
                }`}>
                  <div className="space-y-3">
                    <h2 className="font-serif text-2xl md:text-4xl text-luxury-cream leading-tight">
                      {villa.name}
                    </h2>
                  </div>

                  <p className="text-luxury-cream/70 leading-relaxed font-light text-sm">
                    {villa.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Global CTA Section */}
        <div className="max-w-5xl mx-auto pt-12">
          <div className="relative rounded-3xl p-8 md:p-12 bg-gradient-to-br from-luxury-charcoal to-luxury-obsidian border border-luxury-gold/20 text-center space-y-6 gold-glow overflow-hidden">
            <div className="absolute inset-0 bg-luxury-gold/5 opacity-50 mix-blend-overlay pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <span className="text-luxury-gold uppercase tracking-[0.3em] text-[10px] md:text-xs font-semibold block">
                Reserve Your Sanctuary
              </span>
              <h2 className="font-serif text-2xl md:text-4xl text-luxury-cream leading-tight">
                Ready to Claim Your Private Villa?
              </h2>
              <p className="text-luxury-cream/60 max-w-2xl mx-auto text-xs md:text-sm font-light">
                Submit a private inquiry and our dedicated concierge team will coordinate your bespoke oceanfront stay within 24 hours.
              </p>
            </div>

            <div className="pt-2 relative z-10">
              <Link
                href="/#inquiry"
                className="inline-flex w-full sm:w-auto min-w-[280px] bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-bold text-xs uppercase tracking-[0.2em] py-4 px-8 rounded-full shadow-lg active:scale-98 transition-all items-center justify-center gap-2 border-none text-center"
              >
                Submit Booking Inquiry <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
