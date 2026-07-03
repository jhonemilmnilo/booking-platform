"use client"

import * as React from "react"
import { getSystemSettingsAction } from "@/app/auth/actions"

interface TouristSpot {
  name: string
  distance: string
}

export default function Location() {
  const [selectedSpot, setSelectedSpot] = React.useState<TouristSpot | null>(null)
  const [touristSpots, setTouristSpots] = React.useState<TouristSpot[]>([
    { name: "Abagatanen White Beach", distance: "1 min Walk" },
    { name: "Agno Umbrella Rocks", distance: "8 mins Shore Drive" },
    { name: "Bani Olanen Beach", distance: "12 mins Drive" },
    { name: "Hundred Islands (Alaminos)", distance: "35 mins Resort Shuttle" },
    { name: "Cape Bolinao Lighthouse", distance: "45 mins Private Charter" }
  ])

  React.useEffect(() => {
    getSystemSettingsAction()
      .then((settings) => {
        if (settings.touristSpots) {
          try {
            const parsed = JSON.parse(settings.touristSpots)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTouristSpots(parsed)
            }
          } catch (e) {
            console.error("Failed to parse tourist spots JSON:", e)
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to load tourist spots dynamically:", err)
      })
  }, [])

  const mapSrc = selectedSpot
    ? `https://maps.google.com/maps?saddr=16.1651539,119.7720002&daddr=${encodeURIComponent(selectedSpot.name + ", Pangasinan")}&output=embed`
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.80164287841!2d119.7698115!3d16.1651539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3393bf4c24e3fb71%3A0x8c3d523edc639aaa!2sThe%20Oceanhill%20Villas!5e0!3m2!1sen!2sph!4v1719918239000!5m2!1sen!2sph"

  return (
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
            <span className="text-luxury-gold font-bold uppercase text-[10px] tracking-widest block">Nearest Attractions (Click for Directions)</span>
            <div className="space-y-2.5 text-sm text-luxury-cream/80">
              {touristSpots.map((spot, index) => {
                const isActive = selectedSpot?.name === spot.name
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedSpot(spot)}
                    className={`w-full text-left grid grid-cols-12 gap-2 border-b border-luxury-gold/10 pb-2 hover:text-luxury-gold transition-colors duration-300 group cursor-pointer ${isActive ? "text-luxury-gold font-bold" : ""
                      }`}
                  >
                    <span className="flex items-start gap-2 col-span-7 md:col-span-8">
                      <i className={`fa-solid fa-location-dot text-[10px] mt-1 transition-transform duration-300 ${isActive ? "text-luxury-gold scale-125" : "text-luxury-gold/40 group-hover:scale-125 group-hover:text-luxury-gold"
                        }`}></i>
                      <span className="leading-snug">{spot.name}</span>
                    </span>
                    <span className="text-luxury-gold font-semibold text-xs text-right col-span-5 md:col-span-4 pt-0.5 flex items-start justify-end gap-1">
                      <span className="leading-snug">{spot.distance}</span>
                      <i className="fa-solid fa-chevron-right text-[9px] opacity-0 group-hover:opacity-100 transition-opacity mt-1"></i>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Radar / Map Representation */}
        <div className="lg:col-span-7 bg-luxury-obsidian/60 border border-luxury-gold/30 rounded-3xl overflow-hidden p-3 gold-glow">
          <div className="relative h-[380px] rounded-2xl overflow-hidden bg-luxury-charcoal flex items-center justify-center border border-luxury-gold/15">
            <iframe
              src={mapSrc}
              className="absolute inset-0 w-full h-full border-none filter invert-[90%] hue-rotate-[180deg] saturate-[40%] contrast-[95%] brightness-[90%]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {selectedSpot && (
              <button
                onClick={() => setSelectedSpot(null)}
                className="absolute top-4 left-4 bg-luxury-obsidian/95 border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-obsidian px-3.5 py-2 rounded-xl text-[10px] tracking-wider uppercase font-serif font-semibold shadow-2xl transition-all duration-300 cursor-pointer z-30 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i> Reset View
              </button>
            )}

            {/* Coordinates */}

          </div>
        </div>
      </div>
    </section>
  )
}
