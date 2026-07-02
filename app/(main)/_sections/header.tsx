"use client"

import * as React from "react"
import { Room } from "@/components/shared/RoomCard"

interface HeaderProps {
  brandName: string;
  brandLogo: string;
  isLoggedIn: boolean;
  isHeaderScrolled: boolean;
  onBookClick: (room: Room) => void;
  onLogOut: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: (isOpen: boolean) => void;
  mockRooms: Room[];
}

export default function Header({
  brandName,
  brandLogo,
  isLoggedIn,
  isHeaderScrolled,
  onBookClick,
  onLogOut,
  isMobileMenuOpen,
  onMobileMenuToggle,
  mockRooms,
}: HeaderProps) {
  return (
    <header
      id="mainHeader"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 py-4 px-4 md:py-6 md:px-12 flex justify-between items-center ${
        isHeaderScrolled
          ? "bg-luxury-obsidian/95 py-3 md:py-4 border-b border-luxury-gold/15 backdrop-blur-md shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3 whitespace-nowrap flex-shrink-0">
        {brandLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brandLogo}
            alt="Logo"
            className="w-7 h-7 md:w-10 md:h-10 object-contain rounded"
          />
        ) : (
          <svg className="w-7 h-7 md:w-10 md:h-10 text-luxury-gold filter drop-shadow flex-shrink-0" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" fill="none" stroke="#D4AF37" strokeWidth="2" />
            <path d="M50 15 L75 30 L75 60 L50 82 L25 60 L25 30 Z" fill="none" stroke="#D4AF37" strokeDasharray="2,2" />
            <circle cx="50" cy="48" r="8" fill="#D4AF37" />
            <path d="M50 20 L50 40 M50 56 L50 78 M32 48 L42 48 M58 48 L68 48" stroke="#D4AF37" strokeWidth="1.5" />
          </svg>
        )}
        <span
          id="brandName"
          className={`font-serif text-sm sm:text-base md:text-2xl tracking-[0.25em] uppercase font-semibold transition-colors duration-300 whitespace-nowrap ${
            isHeaderScrolled ? "text-luxury-cream" : "text-white"
          }`}
        >
          {brandName.split(" ")[0]} <span className="text-luxury-gold">{brandName.split(" ").slice(1).join(" ")}</span>
        </span>
      </div>

      {/* Desktop Menu */}
      <nav
        id="desktopNav"
        className={`hidden lg:flex items-center gap-4 xl:gap-8 text-[11px] xl:text-xs uppercase tracking-[0.2em] font-semibold transition-colors duration-300 whitespace-nowrap ${
          isHeaderScrolled ? "text-luxury-cream" : "text-white"
        }`}
      >
        <a href="#about" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
          The Resort
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
        </a>
        <a href="#campaign" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
          The Cinema
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
        </a>
        <a href="#villas" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
          Suites & Villas
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
        </a>
        <a href="#amenities" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
          Amenities
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
        </a>
        <a href="#location" className="relative hover:text-luxury-gold transition-all duration-300 py-1 group/navlink">
          The Beachfront
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold scale-x-0 group-hover/navlink:scale-x-100 transition-transform duration-300 origin-left" />
        </a>
      </nav>

      {/* Sensory Toggles & Action */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          onClick={() => onBookClick(mockRooms[0])}
          className="hidden sm:inline-block bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-semibold text-xs uppercase tracking-[0.2em] px-6 py-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
        >
          Reserve Experience
        </button>

        {isLoggedIn && (
          <button
            onClick={onLogOut}
            className="hidden sm:inline-block border border-luxury-gold/50 hover:bg-luxury-gold/10 text-luxury-cream font-semibold text-xs uppercase tracking-[0.2em] px-6 py-3.5 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          >
            Log Out
          </button>
        )}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => onMobileMenuToggle(!isMobileMenuOpen)}
          className={`lg:hidden hover:text-luxury-gold p-2 transition-colors cursor-pointer z-50 relative ${
            isHeaderScrolled || isMobileMenuOpen ? "text-luxury-cream" : "text-white"
          }`}
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-5 flex flex-col justify-between relative overflow-hidden">
            <span
              className={`w-full h-[2px] bg-currentColor transition-all duration-300 transform origin-left ${
                isMobileMenuOpen ? "rotate-45 translate-x-[2px] translate-y-[-1px]" : ""
              }`}
            ></span>
            <span
              className={`w-full h-[2px] bg-currentColor transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0 translate-x-[20px]" : ""
              }`}
            ></span>
            <span
              className={`w-full h-[2px] bg-currentColor transition-all duration-300 transform origin-left ${
                isMobileMenuOpen ? "-rotate-45 translate-x-[2px] translate-y-[1px]" : ""
              }`}
            ></span>
          </div>
        </button>
      </div>
    </header>
  )
}
