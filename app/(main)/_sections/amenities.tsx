"use client"

import * as React from "react"

export default function Amenities() {
  return (
    <section id="amenities" className="py-24 md:py-36 px-6 md:px-12 bg-luxury-obsidian relative">
      <div className="absolute top-1/2 left-10 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 gsap-reveal-fade-up">
          <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Tailored Lifestyles</span>
          <h2 className="font-serif text-4xl md:text-6xl text-luxury-cream">
            Your Absolute <span className="text-gold-gradient italic">Prerogative</span>
          </h2>
          <p className="text-luxury-cream/60 max-w-2xl mx-auto text-sm md:text-base">
            Every detail of your stay is curated by certified luxury hospitality concierges, matching standard European royal protocols.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gsap-reveal-stagger-container">
          {/* Card 1 */}
          <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group gsap-reveal-stagger-item">
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
          <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group gsap-reveal-stagger-item">
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
          <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group gsap-reveal-stagger-item">
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
          <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group gsap-reveal-stagger-item">
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
          <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group gsap-reveal-stagger-item">
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
          <div className="bg-luxury-charcoal/40 border border-luxury-cream/10 rounded-2xl p-8 hover:border-luxury-gold/40 transition-all duration-300 gold-glow-hover flex flex-col justify-between group gsap-reveal-stagger-item">
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
  )
}
