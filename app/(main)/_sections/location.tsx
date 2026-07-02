"use client"

import * as React from "react"

export default function Location() {
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
  )
}
