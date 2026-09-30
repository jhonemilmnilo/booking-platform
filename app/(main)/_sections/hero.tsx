"use client"

import * as React from "react"
import { Room } from "@/components/shared/RoomCard"

/* Temporarily hidden reservation inquiry bar components & helpers
interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  icon: string;
}

function CustomSelect({ value, onChange, options, placeholder, icon }: CustomSelectProps) {
...
}

const GUEST_OPTIONS = [...]
const CURATION_OPTIONS = [...]
*/

interface HeroProps {
  videoSrc: string;
  heroSubtitle: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  themeColorPrimary?: string;
  onSearchSubmit?: (villa: string, checkIn: string, checkOut: string, guests: string, curation: string) => void;
  videoPlayerRef: React.RefObject<HTMLVideoElement | null>;
  rooms?: Room[];
}

export default function Hero({
  videoSrc,
  heroSubtitle,
  heroTitleLine1,
  heroTitleLine2,
  heroDescription,
  videoPlayerRef,
}: HeroProps) {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07080A]">
      {/* Background cinematic playlist wrapper */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-[#07080A]">
        {/* Subtle luxury fallback image in case video is buffering */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.38] scale-[1.03]"
          style={{ backgroundImage: `url('/images/image7.webp')` }}
        />
        {videoSrc && (
          <video
            ref={videoPlayerRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            poster="/images/image7.webp"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] scale-[1.03]"
          />
        )}
        {/* Cinematic vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/85" />
      </div>

      {/* Main hero copywriting content */}
      <div className="relative z-20 max-w-5xl mx-auto text-center px-6 mt-16 md:mt-24 space-y-6 md:space-y-8 select-none">
        <span
          id="heroSubtitle"
          className="text-luxury-gold font-semibold tracking-[0.4em] uppercase text-[10px] md:text-xs block animate-fade-in-slow"
        >
          ★ {heroSubtitle} ★
        </span>

        <h1
          id="heroTitle"
          className="font-serif text-3xl sm:text-5xl md:text-7xl text-white leading-[1.1] md:leading-[1.15] tracking-wide animate-fade-in-up"
        >
          {heroTitleLine1} <br />
          <span className="bg-clip-text text-transparent text-gold-gradient italic">{heroTitleLine2}</span>
        </h1>

        <p
          id="heroDescription"
          className="text-white/80 max-w-2xl mx-auto text-xs sm:text-sm md:text-base font-light leading-relaxed tracking-wide animate-fade-in-up delay-200"
        >
          {heroDescription}
        </p>

        {/* Floating reservation inquiry action bar (temporarily hidden) */}
        {/* <div className="pt-6 md:pt-10 max-w-4xl mx-auto animate-fade-in-up delay-400">
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md border border-luxury-gold/20 rounded-3xl md:rounded-full p-4 md:py-3.5 md:pl-8 md:pr-16 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 items-center shadow-2xl relative gold-glow-soft text-luxury-cream"
          >
            <div className="col-span-2 md:col-span-1 flex flex-col gap-1 text-left bg-white/40 border border-luxury-gold/10 rounded-2xl p-3 md:bg-transparent md:border-none md:p-0 md:border-r border-luxury-gold/20 md:pr-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold">Select Sanctuary</span>
              <CustomSelect
                value={heroVilla}
                onChange={setHeroVilla}
                options={villaOptions}
                placeholder="Select Villa"
                icon="fa-hotel"
              />
            </div>

            <div className="col-span-1 md:col-span-1 flex flex-col gap-1 text-left bg-white/40 border border-luxury-gold/10 rounded-2xl p-3 md:bg-transparent md:border-none md:p-0 md:border-r border-luxury-gold/20 md:pr-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold">Check-in</span>
              <div className="flex items-center gap-2 relative w-full">
                <i className="fa-solid fa-calendar-plus text-luxury-gold text-xs flex-shrink-0"></i>
                <input
                  type="date"
                  required
                  value={heroCheckIn}
                  onChange={(e) => setHeroCheckIn(e.target.value)}
                  className="bg-transparent border-none text-[10px] lg:text-[11px] xl:text-xs font-semibold focus:outline-none w-full text-luxury-cream placeholder-luxury-cream/40"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-1 flex flex-col gap-1 text-left bg-white/40 border border-luxury-gold/10 rounded-2xl p-3 md:bg-transparent md:border-none md:p-0 md:border-r border-luxury-gold/20 md:pr-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold">Check-out</span>
              <div className="flex items-center gap-2 relative w-full">
                <i className="fa-solid fa-calendar-minus text-luxury-gold text-xs flex-shrink-0"></i>
                <input
                  type="date"
                  required
                  value={heroCheckOut}
                  onChange={(e) => setHeroCheckOut(e.target.value)}
                  className="bg-transparent border-none text-[10px] lg:text-[11px] xl:text-xs font-semibold focus:outline-none w-full text-luxury-cream placeholder-luxury-cream/40"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-1 flex flex-col gap-1 text-left bg-white/40 border border-luxury-gold/10 rounded-2xl p-3 md:bg-transparent md:border-none md:p-0 md:border-r border-luxury-gold/20 md:pr-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold">Occupancy</span>
              <CustomSelect
                value={heroGuests}
                onChange={setHeroGuests}
                options={GUEST_OPTIONS}
                placeholder="Rooms & Guests"
                icon="fa-users"
              />
            </div>

            <div className="col-span-1 md:col-span-1 flex flex-col gap-1 text-left bg-white/40 border border-luxury-gold/10 rounded-2xl p-3 md:bg-transparent md:border-none md:p-0">
              <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold">Bespoke Privilege</span>
              <CustomSelect
                value={heroCuration}
                onChange={setHeroCuration}
                options={CURATION_OPTIONS}
                placeholder="Access Privileges"
                icon="fa-award"
              />
            </div>

            <button
              type="submit"
              className="col-span-2 md:absolute md:right-2 md:top-1/2 md:-translate-y-1/2 w-full md:w-12 md:h-12 h-12 rounded-2xl md:rounded-full bg-gold-gradient text-white hover:scale-105 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.15em] border-none"
              aria-label="Confirm Booking Configuration"
            >
              <span className="md:hidden">Check Availability</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </form>
        </div> */}
      </div>
    </section>
  )
}
