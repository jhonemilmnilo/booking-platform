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

        {/* Radar / Map Representation */}
        <div className="lg:col-span-7 bg-luxury-obsidian/60 border border-luxury-gold/30 rounded-3xl overflow-hidden p-3 gold-glow">
          <div className="relative h-[380px] rounded-2xl overflow-hidden bg-luxury-charcoal flex items-center justify-center border border-luxury-gold/15">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.80164287841!2d119.7698115!3d16.1651539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3393bf4c24e3fb71%3A0x8c3d523edc639aaa!2sThe%20Oceanhill%20Villas!5e0!3m2!1sen!2sph!4v1719918239000!5m2!1sen!2sph"
              className="absolute inset-0 w-full h-full border-none filter invert-[90%] hue-rotate-[180deg] saturate-[40%] contrast-[95%] brightness-[90%]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />


            {/* Coordinates */}
            <div className="absolute bottom-4 left-4 bg-luxury-obsidian/95 border border-luxury-gold/25 px-3.5 py-2 rounded-xl text-[10px] tracking-wider text-luxury-gold font-mono backdrop-blur-md shadow-xl z-20">
              LAT 16.1652° N / LONG 119.7720° E
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
