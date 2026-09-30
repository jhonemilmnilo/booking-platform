"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Room } from "@/components/shared/RoomCard"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
  brandName: string;
  brandLogo: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  onBookClick: (room: Room) => void;
  onLogOut: () => void;
  mockRooms: Room[];
}

export default function Header({
  brandName,
  brandLogo,
  isLoggedIn,
  isAdmin = false,
  onLogOut,
}: HeaderProps) {
  const pathname = usePathname()
  const [isHeaderScrolled, setIsHeaderScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true)
  const [activeSection, setActiveSection] = React.useState("")
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsHeaderScrolled(currentScrollY > 50)

      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current) {
          setIsHeaderVisible(false) // scrolling down
        } else {
          setIsHeaderVisible(true) // scrolling up
        }
      } else {
        setIsHeaderVisible(true)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ScrollSpy effect to highlight active navigation link
  React.useEffect(() => {
    if (pathname !== "/") return

    const sections = ["about", "campaign", "villas", "amenities", "location"]
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [pathname])

  const showSolidHeader = isHeaderScrolled || isMobileMenuOpen || pathname !== "/"

  return (
    <header
      id="mainHeader"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 py-3.5 px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-between items-center gap-4 lg:gap-8 ${
        showSolidHeader
          ? "bg-white/95 dark:bg-[#0b0c10]/95 py-2.5 md:py-3.5 border-b border-black/10 dark:border-luxury-gold/15 backdrop-blur-md shadow-md dark:shadow-2xl"
          : "bg-transparent"
      } ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <Link href="/" className="flex items-center gap-2.5 sm:gap-3 whitespace-nowrap flex-shrink-0 group">
        {brandLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brandLogo}
            alt="Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 xl:w-9 xl:h-9 object-contain rounded"
          />
        ) : (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 xl:w-9 xl:h-9 text-luxury-gold filter drop-shadow flex-shrink-0 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M50 15 L75 30 L75 60 L50 82 L25 60 L25 30 Z" fill="none" stroke="currentColor" strokeDasharray="2,2" />
            <circle cx="50" cy="48" r="8" fill="currentColor" />
            <path d="M50 20 L50 40 M50 56 L50 78 M32 48 L42 48 M58 48 L68 48" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
        <span
          id="brandName"
          className="font-serif text-sm sm:text-base lg:text-lg xl:text-xl tracking-[0.18em] xl:tracking-[0.22em] uppercase font-semibold transition-colors duration-300 whitespace-nowrap"
        >
          <span className={showSolidHeader ? "text-[#1C1A17] dark:text-white transition-colors duration-300" : "text-white drop-shadow-sm transition-colors duration-300"}>
            {brandName.split(" ")[0]}
          </span>{" "}
          <span className="text-luxury-gold drop-shadow-sm transition-colors duration-300">
            {brandName.split(" ").slice(1).join(" ")}
          </span>
        </span>
      </Link>

      {/* Desktop Menu */}
      <nav
        id="desktopNav"
        className={`hidden lg:flex items-center justify-center gap-4 lg:gap-5 xl:gap-7 2xl:gap-8 text-[11px] xl:text-xs uppercase tracking-[0.16em] xl:tracking-[0.2em] font-semibold transition-colors duration-300 whitespace-nowrap mx-auto px-4 xl:px-8 ${
          showSolidHeader ? "text-[#1C1A17] dark:text-white" : "text-white drop-shadow-sm"
        }`}
      >
        <Link
          href="/#about"
          className={`relative transition-all duration-300 py-1 group/navlink ${activeSection === "about" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"}`}
        >
          The Resort
          <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold transition-transform duration-300 origin-left ${activeSection === "about" ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"}`} />
        </Link>
        <Link
          href="/#campaign"
          className={`relative transition-all duration-300 py-1 group/navlink ${activeSection === "campaign" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"}`}
        >
          The Cinema
          <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold transition-transform duration-300 origin-left ${activeSection === "campaign" ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"}`} />
        </Link>
        <Link
          href="/#villas"
          className={`relative transition-all duration-300 py-1 group/navlink ${activeSection === "villas" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"}`}
        >
          Suites & Villas
          <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold transition-transform duration-300 origin-left ${activeSection === "villas" ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"}`} />
        </Link>
        <Link
          href="/#amenities"
          className={`relative transition-all duration-300 py-1 group/navlink ${activeSection === "amenities" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"}`}
        >
          Amenities
          <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold transition-transform duration-300 origin-left ${activeSection === "amenities" ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"}`} />
        </Link>
        <Link
          href="/#location"
          className={`relative transition-all duration-300 py-1 group/navlink ${activeSection === "location" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"}`}
        >
          The Beachfront
          <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-luxury-gold transition-transform duration-300 origin-left ${activeSection === "location" ? "scale-x-100" : "scale-x-0 group-hover/navlink:scale-x-100"}`} />
        </Link>
      </nav>

      {/* Sensory Toggles & Action */}
      <div className="flex items-center gap-2.5 sm:gap-3 xl:gap-4 flex-shrink-0">
        {isAdmin && (
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-2 border border-luxury-gold/60 bg-luxury-gold/15 hover:bg-luxury-gold text-luxury-gold hover:text-black font-semibold text-[11px] xl:text-xs uppercase tracking-[0.18em] xl:tracking-[0.2em] px-3.5 py-2 xl:px-4.5 xl:py-2 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_22px_var(--color-luxury-gold)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap group"
            title="Return to Admin Dashboard"
          >
            <i className="fa-solid fa-crown text-[10px] text-luxury-gold group-hover:text-black transition-colors"></i>
            <span>Admin</span>
          </Link>
        )}

        {/* Reserve button temporarily hidden */}
        {/* <button
          onClick={() => onBookClick(mockRooms[0])}
          className="hidden sm:inline-flex items-center justify-center bg-gold-gradient hover:brightness-110 text-white font-semibold text-[11px] xl:text-xs uppercase tracking-[0.22em] px-5 py-2.5 xl:px-6 xl:py-2.5 rounded-full shadow-md hover:shadow-[0_0_22px_var(--color-luxury-gold)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap border-none"
        >
          Reserve
        </button> */}

        {isLoggedIn && (
          <button
            onClick={onLogOut}
            className={`hidden sm:inline-flex items-center justify-center border font-semibold text-[11px] xl:text-xs uppercase tracking-[0.18em] xl:tracking-[0.2em] px-3.5 py-2 xl:px-4.5 xl:py-2 rounded-full shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap ${
              showSolidHeader
                ? "border-black/20 dark:border-white/20 text-[#1C1A17] dark:text-white hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/10"
                : "border-white/35 text-white/95 hover:border-luxury-gold hover:text-luxury-gold hover:bg-white/10 backdrop-blur-sm"
            }`}
          >
            Log Out
          </button>
        )}

        {/* Mobile Quick Admin Button */}
        {isAdmin && (
          <Link
            href="/admin"
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full border border-luxury-gold/60 bg-luxury-gold/15 text-luxury-gold hover:bg-luxury-gold hover:text-black transition-all shadow-[0_0_10px_rgba(212,175,55,0.25)]"
            title="Admin Dashboard"
          >
            <i className="fa-solid fa-crown text-xs"></i>
          </Link>
        )}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden hover:text-luxury-gold p-2 transition-colors cursor-pointer z-50 relative border-none ${
            showSolidHeader ? "text-[#1C1A17] dark:text-white" : "text-white"
          }`}
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-[16px] flex flex-col justify-between items-end relative overflow-hidden">
            <span
              className={`w-full h-[2.5px] bg-current rounded-full transition-all duration-300 transform origin-left ${
                isMobileMenuOpen ? "rotate-45 translate-x-[3px] translate-y-[-1px]" : ""
              }`}
            ></span>
            <span
              className={`w-2/3 h-[2.5px] bg-current rounded-full transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0 translate-x-[15px]" : ""
              }`}
            ></span>
            <span
              className={`w-full h-[2.5px] bg-current rounded-full transition-all duration-300 transform origin-left ${
                isMobileMenuOpen ? "-rotate-45 translate-x-[3px] translate-y-[1px]" : ""
              }`}
            ></span>
          </div>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-full left-0 w-full bg-white/98 dark:bg-[#0b0c10]/98 border-b border-black/10 dark:border-luxury-gold/15 py-6 px-8 flex flex-col gap-4 text-sm uppercase tracking-widest font-semibold lg:hidden shadow-2xl backdrop-blur-md text-[#1C1A17] dark:text-white"
          >
            <Link
              href="/#about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`transition-colors py-2 border-b border-luxury-gold/5 ${
                activeSection === "about" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"
              }`}
            >
              The Resort
            </Link>
            <Link
              href="/#campaign"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`transition-colors py-2 border-b border-luxury-gold/5 ${
                activeSection === "campaign" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"
              }`}
            >
              The Cinema
            </Link>
            <Link
              href="/#villas"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`transition-colors py-2 border-b border-luxury-gold/5 ${
                activeSection === "villas" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"
              }`}
            >
              Suites & Villas
            </Link>
            <Link
              href="/#amenities"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`transition-colors py-2 border-b border-luxury-gold/5 ${
                activeSection === "amenities" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"
              }`}
            >
              Amenities
            </Link>
            <Link
              href="/#location"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`transition-colors py-2 border-b border-luxury-gold/5 ${
                activeSection === "location" ? "text-luxury-gold font-bold" : "hover:text-luxury-gold"
              }`}
            >
              The Beachfront
            </Link>
            <Link
              href="/tour"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-luxury-gold transition-colors py-2 border-b border-luxury-gold/5 text-luxury-gold"
            >
              Virtual Tour
            </Link>

            <div className="pt-2 flex flex-col sm:hidden gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 border border-luxury-gold bg-luxury-gold/15 hover:bg-luxury-gold hover:text-black text-luxury-gold font-semibold text-xs uppercase tracking-[0.2em] py-3 rounded-full shadow-md transition-all text-center"
                >
                  <i className="fa-solid fa-crown text-xs"></i>
                  <span>Admin Dashboard</span>
                </Link>
              )}
              {/* Reserve button temporarily hidden */}
              {/* <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onBookClick(mockRooms[0])
                }}
                className="w-full bg-gold-gradient text-white font-semibold text-xs uppercase tracking-[0.2em] py-3 rounded-full shadow-lg border-none cursor-pointer"
              >
                Reserve
              </button> */}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    onLogOut()
                  }}
                  className="w-full border border-luxury-cream/30 text-luxury-cream font-semibold text-xs uppercase tracking-[0.2em] py-3 rounded-full cursor-pointer"
                >
                  Log Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
