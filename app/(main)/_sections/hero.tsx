"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer p-0"
      >
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <i className={`fa-solid ${icon} text-luxury-gold text-xs flex-shrink-0`}></i>
          <span className={`text-[10px] lg:text-[11px] xl:text-xs font-semibold truncate ${!value ? "text-luxury-cream/40" : "text-luxury-cream"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <i
          className={`fa-solid fa-chevron-down text-luxury-gold/50 text-[10px] ml-2 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 bottom-full mb-3 w-64 bg-white/98 backdrop-blur border border-luxury-gold/30 rounded-2xl py-2 shadow-2xl z-50 gold-glow text-luxury-cream"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-xs hover:bg-luxury-gold/10 transition-colors ${
                  option.value === value ? "text-luxury-gold font-bold bg-luxury-gold/5" : "text-luxury-cream"
                }`}
              >
                <span>{option.label}</span>
                {option.value === value && <i className="fa-solid fa-check text-luxury-gold text-xs"></i>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const VILLA_OPTIONS = [
  { value: "royal-suite", label: "Royal Suite" },
  { value: "garden-villa", label: "Garden Villa" },
  { value: "lagoon-suite", label: "Lagoon Suite" }
]

const GUEST_OPTIONS = [
  { value: "1 Guest", label: "1 Room, 1 Guest" },
  { value: "2 Guests", label: "1 Room, 2 Guests" },
  { value: "4 Guests", label: "1 Room, 4 Guests" },
  { value: "6 Guests", label: "2 Rooms, 6 Guests" }
]

const CURATION_OPTIONS = [
  { value: "Standard Resort Guest", label: "Standard Guest" },
  { value: "VIP Beach Club Access", label: "VIP Beach Club" },
  { value: "Presidential All-Inclusive Access", label: "Presidential Access" }
]

interface HeroProps {
  videoSrc: string;
  heroSubtitle: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  themeColorPrimary: string;
  onSearchSubmit: (villa: string, checkIn: string, checkOut: string, guests: string, curation: string) => void;
  videoPlayerRef: React.RefObject<HTMLVideoElement | null>;
}

export default function Hero({
  videoSrc,
  heroSubtitle,
  heroTitleLine1,
  heroTitleLine2,
  heroDescription,
  themeColorPrimary,
  onSearchSubmit,
  videoPlayerRef,
}: HeroProps) {
  // Hero booking search form states
  const [heroVilla, setHeroVilla] = React.useState("")
  const [heroCheckIn, setHeroCheckIn] = React.useState("")
  const [heroCheckOut, setHeroCheckOut] = React.useState("")
  const [heroGuests, setHeroGuests] = React.useState("")
  const [heroCuration, setHeroCuration] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchSubmit(heroVilla, heroCheckIn, heroCheckOut, heroGuests, heroCuration)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-luxury-obsidian">
      {/* Background cinematic playlist wrapper */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {videoSrc && (
          <video
            ref={videoPlayerRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] scale-[1.03]"
          />
        )}

      </div>

      {/* Main hero copywriting content */}
      <div className="relative z-20 max-w-5xl mx-auto text-center px-6 mt-16 md:mt-24 space-y-6 md:space-y-8 select-none">
        <span
          id="heroSubtitle"
          style={{ color: themeColorPrimary }}
          className="font-semibold tracking-[0.4em] uppercase text-[10px] md:text-xs block animate-fade-in-slow"
        >
          ★ {heroSubtitle} ★
        </span>

        <h1
          id="heroTitle"
          className="font-serif text-3xl sm:text-5xl md:text-7xl text-white leading-[1.1] md:leading-[1.15] tracking-wide animate-fade-in-up"
        >
          {heroTitleLine1} <br />
          <span className="text-gold-gradient italic">{heroTitleLine2}</span>
        </h1>

        <p
          id="heroDescription"
          className="text-white/80 max-w-2xl mx-auto text-xs sm:text-sm md:text-base font-light leading-relaxed tracking-wide animate-fade-in-up delay-200"
        >
          {heroDescription}
        </p>

        {/* Floating reservation inquiry action bar */}
        <div className="pt-6 md:pt-10 max-w-4xl mx-auto animate-fade-in-up delay-400">
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md border border-luxury-gold/20 rounded-3xl md:rounded-full p-4 md:py-3.5 md:pl-8 md:pr-16 grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 items-center shadow-2xl relative gold-glow-soft text-luxury-cream"
          >
            {/* Suite/Villa Selection */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-1 text-left bg-white/40 border border-luxury-gold/10 rounded-2xl p-3 md:bg-transparent md:border-none md:p-0 md:border-r border-luxury-gold/20 md:pr-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold">Select Sanctuary</span>
              <CustomSelect
                value={heroVilla}
                onChange={setHeroVilla}
                options={VILLA_OPTIONS}
                placeholder="Select Villa"
                icon="fa-hotel"
              />
            </div>

            {/* Check-In Input */}
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

            {/* Check-Out Input */}
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

            {/* Guests Count select dropdown */}
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

            {/* Custom privileges curation select dropdown */}
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

            {/* Submit Button */}
            <button
              type="submit"
              className="col-span-2 md:absolute md:right-2 md:top-1/2 md:-translate-y-1/2 w-full md:w-12 md:h-12 h-12 rounded-2xl md:rounded-full bg-gold-gradient text-luxury-obsidian hover:scale-105 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.15em] border-none"
              aria-label="Confirm Booking Configuration"
            >
              <span className="md:hidden">Check Availability</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
