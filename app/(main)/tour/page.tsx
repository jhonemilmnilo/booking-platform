"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const TOUR_NODES = [
  {
    id: "pool",
    name: "Infinity Ocean Pool",
    location: "West Wing Beachfront",
    imageUrl: "/images/image6.png",
    description: "Our signature heated overwater lagoon pool offering direct panoramic vistas of the Aegean shoreline waves. Designed to blend seamlessly with the marine horizon, it features private cabanas and daybed service.",
    details: [
      { label: "Water Temp", value: "Constant 28°C" },
      { label: "Resort Access", value: "24/7 Exclusive" },
      { label: "Features", value: "Underwater Sound System" },
      { label: "Service", value: "Daybed Butler Curation" }
    ],
  },
  {
    id: "lounge",
    name: "Luxury Sea Lounge",
    location: "East Wing Club House",
    imageUrl: "/images/image4.png",
    description: "Handcrafted marble bars, glass flooring, and premium vintage lounges overlooking private yacht arrivals. A cozy, high-end environment designed for late-night cocktails, champagne tastings, and relaxed socializing.",
    details: [
      { label: "Drink Menu", value: "Artisanal & Aged Spirits" },
      { label: "Views", value: "Harbor & Lagoon Pools" },
      { label: "Feature", value: "Glass Floor Over Reefs" },
      { label: "Atmosphere", value: "Acoustic Ambient Jazz" }
    ],
  },
  {
    id: "balcony",
    name: "Royal Suite Balcony",
    location: "Royal Suite Terrace",
    imageUrl: "/images/image3.png",
    description: "Enjoy sunset champagne service directly on your custom white-sand balcony deck. Equipped with an open-air plunge pool, handcrafted sunbeds, and a fire pit, it is the ultimate vantage point for coastal sunsets.",
    details: [
      { label: "Pool Type", value: "Private Plunge Pool" },
      { label: "Terrace Area", value: "85 SQM Deck Space" },
      { label: "Sunset Index", value: "Unobstructed 180° Views" },
      { label: "Dedicated Service", value: "In-Suite Butler Care" }
    ],
  },
  {
    id: "vista",
    name: "Peninsula Aerial Vista",
    location: "Sanctuary Cove Heights",
    imageUrl: "/images/image5.png",
    description: "A breathtaking drone view of our completely secluded white-sand peninsula and private coral reefs. Guarded by natural cliff borders and security gates, it guarantees absolute privacy for all guests.",
    details: [
      { label: "Total Area", value: "12 Private Hectares" },
      { label: "Seclusion Rate", value: "100% Gated Peninsula" },
      { label: "Marine Life", value: "Protected Coral Reefs" },
      { label: "Coastline", value: "400m Private Shoreline" }
    ],
  },
  {
    id: "guest-wing",
    name: "Oceanfront Guest Wing",
    location: "South Shore Wing",
    imageUrl: "/images/image7.webp",
    description: "Sprawling private terraces directly overlooking the resort's private yacht harbor and sailing docks. Built with natural volcanic stone and local timbers, these suites blend harmoniously into the coast.",
    details: [
      { label: "Direct Access", value: "Private Beach Walkways" },
      { label: "View Rating", value: "Panoramic Sea Vistas" },
      { label: "Materials", value: "Local Timber & Stone" },
      { label: "Capacity", value: "Dual Suite Configurations" }
    ],
  },
]

export default function TourPage() {
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
              <Link href="/#about" className="hover:text-luxury-gold transition-colors duration-300">
                Home
              </Link>
              <span className="text-luxury-gold/30">/</span>
              <span className="text-luxury-gold font-bold">Virtual Tour</span>
            </div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-luxury-cream/45 font-medium hidden sm:inline">
              Virtual Walkthrough Experience
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-luxury-gold uppercase tracking-[0.4em] text-[10px] md:text-xs font-semibold block">
            Exclusive Visual Dossier
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-luxury-cream leading-tight">
            Explore the <span className="text-gold-gradient italic">Sanctuary Details</span>
          </h1>
          <p className="text-luxury-cream/70 leading-relaxed font-light text-sm md:text-base">
            Take a sensory walk through our spotlight destinations below to explore the engineering, amenities, and absolute privacy of each location.
          </p>
        </div>

        {/* Cinematic Tour Sections List */}
        <div className="space-y-24 md:space-y-36 pt-2">
          {TOUR_NODES.map((node, index) => {
            const isEven = index % 2 === 0
            return (
              <div 
                key={node.id}
                id={node.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Visual Card (Alternating Layout) */}
                <div className={`lg:col-span-7 relative group rounded-3xl overflow-hidden border border-luxury-gold/15 shadow-2xl h-[300px] md:h-[450px] bg-luxury-charcoal gold-glow ${
                  isEven ? "lg:order-1" : "lg:order-2"
                }`}>
                  <Image
                    src={node.imageUrl}
                    alt={node.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Location badge on top of image */}
                  <div className="absolute top-4 left-4 bg-luxury-obsidian/85 border border-luxury-gold/30 h-7 px-3.5 rounded-full backdrop-blur-sm z-20 flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-widest text-luxury-cream font-bold leading-none">
                      {node.location}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className={`lg:col-span-5 space-y-6 ${
                  isEven ? "lg:order-2 lg:pl-8" : "lg:order-1 lg:pr-8"
                }`}>
                  <div className="space-y-3">
                    <h2 className="font-serif text-2xl md:text-4xl text-luxury-cream leading-tight">
                      {node.name}
                    </h2>
                  </div>

                  <p className="text-luxury-cream/70 leading-relaxed font-light text-sm">
                    {node.description}
                  </p>

                  {/* Glassmorphism Facts Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {node.details.map((detail, dIdx) => (
                      <div 
                        key={dIdx} 
                        className="bg-luxury-charcoal/40 border border-luxury-gold/10 p-3 rounded-xl backdrop-blur-sm"
                      >
                        <span className="text-[8px] uppercase tracking-widest text-luxury-cream/45 block mb-1">
                          {detail.label}
                        </span>
                        <span className="text-xs text-luxury-cream font-semibold font-serif">
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
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
                Exclusive Invitation
              </span>
              <h2 className="font-serif text-2xl md:text-4xl text-luxury-cream leading-tight">
                Ready to Experience the Sanctuary?
              </h2>
              <p className="text-luxury-cream/60 max-w-2xl mx-auto text-xs md:text-sm font-light">
                Submit an inquiry dossier today and let our private concierges coordinate your personal overwater retreat.
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
