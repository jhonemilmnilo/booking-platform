"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, X, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { getRoomsAction } from "@/app/admin/rooms_suites/action"
import { getClientCachedRooms, setClientCachedRooms } from "@/lib/client-cache"
import { Room } from "@/components/shared/RoomCard"
import { BookingContext } from "@/app/(main)/layout"

const FALLBACK_ROOMS: Room[] = [
  {
    id: "5br-6ba-private-pool-villa",
    name: "5BR/6BA Private Pool Villa",
    description: "Our premier signature resort residence. Boasts 5 luxurious bedrooms, 6 bathrooms, a private pool, a complete kitchen, and a spacious package inclusive of breakfast for 18 guests. Enjoy ocean views and elite comfort.",
    pricePerNight: 55000,
    capacity: 25,
    imageUrl: "/images/image7.webp",
    size: "5 Bedrooms / 6 Baths",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image7.webp", "/images/image.png", "/images/image5.png", "/images/image4.png"],
  },
  {
    id: "3br-3ba-private-pool-villa",
    name: "3BR/3BA Private Pool Villa",
    description: "A gorgeous coastal retreat featuring 3 beautifully appointed bedrooms, 3 bathrooms, and a private pool. The package includes breakfast for 12 guests, perfect for families and small groups.",
    pricePerNight: 41000,
    capacity: 20,
    imageUrl: "/images/image1.png",
    size: "3 Bedrooms / 3 Baths",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image1.png", "/images/image3.png", "/images/image4.png", "/images/image.png"],
  },
  {
    id: "2br-2ba-private-pool-villa-b",
    name: "2BR/2BA Private Pool Villa B",
    description: "A larger alternative to Villa A, featuring 2 bedrooms, 2 bathrooms, and a private pool. Accommodates up to 10 guests and includes breakfast for 6 guests.",
    pricePerNight: 23000,
    capacity: 10,
    imageUrl: "/images/image3.png",
    size: "2 Bedrooms / 2 Baths (B)",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image3.png", "/images/image4.png", "/images/image5.png", "/images/image6.png"],
  },
  {
    id: "2br-2ba-private-pool-villa-a",
    name: "2BR/2BA Private Pool Villa A",
    description: "Sleek and comfortable private villa hosting 2 bedrooms, 2 bathrooms, a private pool, and breakfast for 6 guests. Ideal for close-knit groups seeking a peaceful getaway.",
    pricePerNight: 21000,
    capacity: 8,
    imageUrl: "/images/image2.png",
    size: "2 Bedrooms / 2 Baths (A)",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image2.png", "/images/image6.png", "/images/image5.png", "/images/image3.png"],
  },
  {
    id: "1br-1ba-private-pool-villa",
    name: "1BR/1BA Private Pool Villa",
    description: "An intimate romantic sanctuary featuring 1 bedroom, 1 bathroom, and a private pool. The package includes breakfast for 2 guests, perfect for couples.",
    pricePerNight: 13000,
    capacity: 5,
    imageUrl: "/images/image4.png",
    size: "1 Bedroom / 1 Bath",
    amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
    images: ["/images/image4.png", "/images/image5.png", "/images/image6.png", "/images/image.png"],
  },
]

function getAmenityIcon(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes("pool")) return "fa-droplet"
  if (lower.includes("breakfast") || lower.includes("wine") || lower.includes("dine")) return "fa-utensils"
  if (lower.includes("kitchen") || lower.includes("cook")) return "fa-kitchen-set"
  if (lower.includes("air") || lower.includes("ac")) return "fa-wind"
  if (lower.includes("pet")) return "fa-paw"
  if (lower.includes("tv") || lower.includes("television")) return "fa-tv"
  if (lower.includes("linen") || lower.includes("towel")) return "fa-shirt"
  if (lower.includes("deck") || lower.includes("view")) return "fa-mountain-sun"
  if (lower.includes("spa")) return "fa-spa"
  return "fa-circle-check"
}

// =========================================================================
// 1. VillaCard: 4-Column Grid Card with Image & Small Details
// =========================================================================
function VillaCard({
  room,
  index,
  onSelect,
  onBookClick,
}: {
  room: Room
  index: number
  onSelect: (room: Room) => void
  onBookClick: (room: Room) => void
}) {
  const photoCount = room.images && room.images.length > 0 ? room.images.length : 1

  return (
    <div
      onClick={() => onSelect(room)}
      className="group relative bg-white dark:bg-[#16171b] border border-black/10 dark:border-white/10 hover:border-luxury-gold/60 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5 h-full"
    >
      {/* Image Thumbnail Header */}
      <div className="relative h-60 sm:h-64 md:h-72 w-full overflow-hidden bg-black/5 dark:bg-black/30">
        <Image
          src={room.imageUrl || "/images/image7.webp"}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          priority={index < 4}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <span className="bg-black/75 backdrop-blur-md border border-white/20 text-luxury-gold text-[10px] sm:text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full shadow-md">
            Residence #{index + 1}
          </span>

          <span className="bg-white/95 dark:bg-luxury-obsidian/95 backdrop-blur-md border border-luxury-gold/40 text-[#1C1A17] dark:text-luxury-cream text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md">
            ₱{room.pricePerNight.toLocaleString()}{" "}
            <span className="text-[9px] font-normal text-[#5C564F] dark:text-white/60">/ NT</span>
          </span>
        </div>

        {/* Bottom Specs Bar on Image */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/95 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 pointer-events-none">
          <span className="flex items-center gap-1.5 truncate font-medium">
            <i className="fa-solid fa-bed text-luxury-gold text-xs"></i>
            <span className="truncate">{room.size}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium shrink-0">
            <i className="fa-solid fa-users text-luxury-gold text-xs"></i>
            <span>Up to {room.capacity} VIPs</span>
          </span>
        </div>

        {/* Multi-Photo Indicator Badge */}
        {photoCount > 1 && (
          <div className="absolute top-12 right-3.5 z-10 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <i className="fa-solid fa-images text-[9px] text-luxury-gold"></i>
            <span>{photoCount} Photos</span>
          </div>
        )}
      </div>

      {/* Small Details Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-luxury-gold uppercase tracking-[0.2em] text-[10px] font-bold">
              Private Sanctuary
            </span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1A17] dark:text-white group-hover:text-luxury-gold transition-colors line-clamp-1">
            {room.name}
          </h3>

          <p className="text-xs sm:text-sm text-[#5C564F] dark:text-white/70 line-clamp-2 leading-relaxed font-light">
            {room.description}
          </p>

          {/* Quick Privileges Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-black/5 dark:bg-white/5 text-[#3A352F] dark:text-white/80 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/5"
              >
                <i className={`fa-solid text-luxury-gold text-[10px] ${getAmenityIcon(amenity)}`}></i>
                <span className="truncate max-w-[130px]">{amenity}</span>
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="inline-flex items-center text-[11px] text-luxury-gold font-semibold px-1 py-1">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(room)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-luxury-gold hover:text-[#1C1A17] dark:hover:text-white transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onBookClick(room)
            }}
            className="bg-gold-gradient hover:brightness-110 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm shadow-luxury-gold/20 transition-all cursor-pointer"
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  )
}

// =========================================================================
// 2. VillaDetailView: The Full Showcase Card from User's Screenshot (Full Width)
// =========================================================================
function VillaDetailView({
  room,
  index,
  onBookClick,
  onClose,
}: {
  room: Room
  index: number
  onBookClick: (room: Room) => void
  onClose: () => void
}) {
  const allImages = React.useMemo(() => {
    const list: string[] = []
    if (room.imageUrl) list.push(room.imageUrl)
    if (room.images && Array.isArray(room.images)) {
      for (const img of room.images) {
        if (img && !list.includes(img)) list.push(img)
      }
    }
    return list.length > 0 ? list : ["/images/image7.webp"]
  }, [room.imageUrl, room.images])

  const [activeImageIdx, setActiveImageIdx] = React.useState(0)
  const activeImage = allImages[activeImageIdx] || room.imageUrl || "/images/image7.webp"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-start">
      {/* Left: Visual Gallery Card (Expansive Full Width) */}
      <div className="lg:col-span-7 space-y-4 sm:space-y-5">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg h-[340px] sm:h-[440px] md:h-[520px] lg:h-[580px] xl:h-[640px] bg-black/5 dark:bg-black/40">
          <Image
            src={activeImage}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-500"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-3 z-10">
            <span className="bg-black/75 backdrop-blur-md border border-white/20 text-luxury-gold text-xs sm:text-sm uppercase tracking-widest font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-2">
              <i className="fa-solid fa-umbrella-beach"></i>
              <span>PRIVATE SANCTUARY</span>
            </span>

            <span className="bg-white/95 dark:bg-luxury-obsidian/95 backdrop-blur-md border border-luxury-gold/40 text-[#1C1A17] dark:text-luxury-cream text-xs sm:text-sm uppercase tracking-widest font-bold px-4 py-2 rounded-full shadow-lg">
              ₱{room.pricePerNight.toLocaleString()}{" "}
              <span className="text-[10px] sm:text-xs font-normal text-[#5C564F] dark:text-luxury-cream/60">/ NIGHT</span>
            </span>
          </div>

          {/* Bottom Bar on Image */}
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 bg-black/85 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-xs sm:text-sm text-white z-10">
            <span className="flex items-center gap-2.5 font-medium truncate">
              <i className="fa-solid fa-bed text-luxury-gold text-sm"></i>
              <span className="truncate">{room.size}</span>
            </span>
            <span className="flex items-center gap-2.5 font-medium shrink-0">
              <i className="fa-solid fa-users text-luxury-gold text-sm"></i>
              <span>Up to {room.capacity} VIPs</span>
            </span>
          </div>
        </div>

        {/* Multi-Photo Switcher Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {allImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImageIdx(i)}
                className={`relative w-20 h-16 sm:w-28 sm:h-20 lg:w-32 lg:h-22 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 transition-all cursor-pointer ${
                  i === activeImageIdx
                    ? "ring-2 ring-luxury-gold scale-105 shadow-md"
                    : "opacity-60 hover:opacity-100 border border-black/10 dark:border-white/10"
                }`}
                aria-label={`View photo ${i + 1}`}
              >
                <Image src={img} alt={`${room.name} photo ${i + 1}`} fill className="object-cover" sizes="130px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Details Section (Expansive Full Width) */}
      <div className="lg:col-span-5 space-y-6 sm:space-y-8 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-luxury-gold uppercase tracking-[0.25em] text-xs font-bold">
              RESIDENCE #{index + 1}
            </span>
            <span className="text-black/30 dark:text-white/30">•</span>
            <span className="text-xs text-[#5C564F] dark:text-white/50 uppercase tracking-wider font-mono">
              {room.size}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1C1A17] dark:text-white leading-tight font-bold">
            {room.name}
          </h2>

          <p className="text-[#5C564F] dark:text-white/70 text-sm sm:text-base leading-relaxed font-light">
            {room.description}
          </p>
        </div>

        {/* Included Privileges & Amenities */}
        <div className="space-y-3 pt-6 border-t border-black/10 dark:border-white/10">
          <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold block">
            INCLUDED PRIVILEGES & AMENITIES
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-[#3A352F] dark:text-white/85">
            {room.amenities.map((amenity, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 truncate"
              >
                <i className={`fa-solid text-luxury-gold text-sm shrink-0 ${getAmenityIcon(amenity)}`}></i>
                <span className="truncate">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Rate & Reserve Button */}
        <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#7A746B] dark:text-white/40 block">
              STANDARD RATE
            </span>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1A17] dark:text-white">
              ₱{room.pricePerNight.toLocaleString()}{" "}
              <span className="text-xs sm:text-sm font-sans font-normal text-luxury-gold uppercase tracking-wider">
                / NIGHT
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose()
              onBookClick(room)
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gold-gradient hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-[0.2em] py-4 px-9 rounded-xl shadow-lg shadow-luxury-gold/20 transition-all cursor-pointer"
          >
            <i className="fa-solid fa-calendar-check text-sm"></i>
            <span>RESERVE VILLA</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// =========================================================================
// 3. Main VillasPage Component (Full Width Grid & Modal)
// =========================================================================
export default function VillasPage() {
  const handleBookClick = React.useContext(BookingContext)

  const [scrollDirection, setScrollDirection] = React.useState<"up" | "down">("up")
  const [isAtTop, setIsAtTop] = React.useState(true)
  const lastScrollY = React.useRef(0)

  // Hydrate from client cache immediately
  const [rooms, setRooms] = React.useState<Room[]>(() => {
    if (typeof window !== "undefined") {
      const cached = getClientCachedRooms<Room>()
      if (cached && cached.length > 0) return cached
    }
    return FALLBACK_ROOMS
  })

  // Selected room for detailed view modal
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [activeFilter, setActiveFilter] = React.useState<"all" | "large" | "family" | "intimate">("all")

  // Fetch dynamic rooms from server
  React.useEffect(() => {
    getRoomsAction()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setRooms(res.data)
          setClientCachedRooms(res.data)
        }
      })
      .catch((err) => {
        console.warn("[VillasPage] Error fetching dynamic rooms:", err)
      })
  }, [])

  // Auto-open room if URL has matching hash (e.g. /villas#1br-1ba-private-pool-villa)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.replace("#", "")
        const found = rooms.find((r) => r.id === hash)
        if (found) {
          setSelectedRoom(found)
        }
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [rooms])

  // Scroll listener for sticky breadcrumbs
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

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (selectedRoom) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedRoom])

  // ESC key listener to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedRoom(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Filtered rooms
  const filteredRooms = React.useMemo(() => {
    if (activeFilter === "large") return rooms.filter((r) => r.capacity >= 15)
    if (activeFilter === "family") return rooms.filter((r) => r.capacity >= 8 && r.capacity < 15)
    if (activeFilter === "intimate") return rooms.filter((r) => r.capacity < 8)
    return rooms
  }, [rooms, activeFilter])

  // Prev / Next navigation for Modal
  const currentIndex = selectedRoom ? rooms.findIndex((r) => r.id === selectedRoom.id) : -1
  const prevRoom = currentIndex > 0 ? rooms[currentIndex - 1] : null
  const nextRoom = currentIndex >= 0 && currentIndex < rooms.length - 1 ? rooms[currentIndex + 1] : null

  return (
    <main className="bg-[#FAF8F5] dark:bg-[#0b0c10] min-h-screen text-[#1C1A17] dark:text-[#EAE5D9] pt-32 pb-24 overflow-hidden relative transition-colors duration-300">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-luxury-gold/5 rounded-full blur-[150px] pointer-events-none" />

      {/* FULL-WIDTH CONTAINER: Expands across the entire display */}
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10 space-y-10 sm:space-y-12">
        {/* Navigation Breadcrumbs Bar */}
        <div
          className={`w-full transition-all duration-300 ${
            isAtTop
              ? "relative border-b border-black/10 dark:border-white/10 pb-6 pt-0"
              : scrollDirection === "down"
              ? "fixed top-0 left-0 w-full bg-[#FAF8F5]/95 dark:bg-[#0b0c10]/95 backdrop-blur-md px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-4 border-b border-luxury-gold/20 z-40 shadow-2xl translate-y-0 opacity-100"
              : "fixed top-0 left-0 w-full bg-[#FAF8F5]/95 dark:bg-[#0b0c10]/95 backdrop-blur-md px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-4 border-b border-luxury-gold/20 z-40 shadow-2xl -translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-full flex items-center justify-between text-xs uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2 text-[#7A746B] dark:text-white/50">
              <Link href="/#villas" className="hover:text-luxury-gold transition-colors duration-300">
                Home
              </Link>
              <span className="text-luxury-gold/40">/</span>
              <span className="text-luxury-gold font-bold">Suites & Villas</span>
            </div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#7A746B] dark:text-white/40 font-medium hidden sm:inline">
              {rooms.length} Active Sanctuary Residences
            </span>
          </div>
        </div>

        {/* Hero Header Section */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <span className="text-luxury-gold uppercase tracking-[0.4em] text-[10px] md:text-xs font-semibold block">
            Curated Resort Accommodations
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1C1A17] dark:text-white leading-tight font-bold">
            The Luxury <span className="bg-clip-text text-transparent text-gold-gradient italic">Suites & Villas</span>
          </h1>
          <p className="text-[#5C564F] dark:text-white/70 leading-relaxed font-light text-sm md:text-base max-w-3xl mx-auto">
            Each villa is a curated sanctuary of its own — designed with private pools, panoramic ocean view decks, complete chef kitchens, and bespoke coastal luxury.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20"
                : "bg-black/5 dark:bg-white/5 text-[#5C564F] dark:text-white/60 hover:text-[#1C1A17] dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
            }`}
          >
            All Residences ({rooms.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("large")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === "large"
                ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20"
                : "bg-black/5 dark:bg-white/5 text-[#5C564F] dark:text-white/60 hover:text-[#1C1A17] dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
            }`}
          >
            Large Estates (15+ VIPs)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("family")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === "family"
                ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20"
                : "bg-black/5 dark:bg-white/5 text-[#5C564F] dark:text-white/60 hover:text-[#1C1A17] dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
            }`}
          >
            Family & Friends (8–14 VIPs)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("intimate")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === "intimate"
                ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20"
                : "bg-black/5 dark:bg-white/5 text-[#5C564F] dark:text-white/60 hover:text-[#1C1A17] dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10"
            }`}
          >
            Intimate Villas (Up to 7 VIPs)
          </button>
        </div>

        {/* 4-Column Grid of Residences (Full Width) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="h-full"
              >
                <VillaCard
                  room={room}
                  index={index}
                  onSelect={(r) => setSelectedRoom(r)}
                  onBookClick={handleBookClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Global Bespoke Concierge CTA Banner */}
        <div className="w-full max-w-[1850px] mx-auto pt-10">
          <div className="relative rounded-3xl p-8 md:p-12 lg:p-16 bg-white dark:bg-[#16171b] border border-luxury-gold/30 text-center space-y-6 shadow-2xl overflow-hidden">
            <div className="space-y-3 relative z-10 max-w-4xl mx-auto">
              <span className="text-luxury-gold uppercase tracking-[0.3em] text-[10px] md:text-xs font-semibold block">
                Exclusive Custom Arrangements
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1C1A17] dark:text-white leading-tight font-bold">
                Planning a Wedding, Retreat, or Full Resort Buyout?
              </h2>
              <p className="text-[#5C564F] dark:text-white/60 max-w-2xl mx-auto text-xs md:text-sm font-light">
                Our executive concierge coordinates multi-villa reservations, private chef catering, yacht tenders, and curated itineraries.
              </p>
            </div>

            <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#inquiry"
                className="inline-flex w-full sm:w-auto min-w-[240px] bg-gold-gradient hover:brightness-110 text-white font-bold text-xs uppercase tracking-[0.2em] py-4 px-8 rounded-full shadow-lg active:scale-95 transition-all items-center justify-center gap-2 border-none text-center cursor-pointer"
              >
                <span>Submit Private Inquiry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#villas"
                className="inline-flex w-full sm:w-auto px-6 py-4 rounded-full border border-black/10 dark:border-white/10 hover:border-luxury-gold text-xs font-semibold uppercase tracking-wider text-[#5C564F] dark:text-white/70 hover:text-[#1C1A17] dark:hover:text-white transition-all items-center justify-center cursor-pointer"
              >
                Back to Overview
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Full-Width Modal Dialog: Displays the Room & Suite Details at Full Scale  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedRoom && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto"
          >
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoom(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 cursor-pointer"
            />

            {/* FULL-WIDTH Modal Dialog Container: Expands up to 96vw / 1750px */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="relative z-50 bg-white dark:bg-[#16171b] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 lg:p-14 shadow-2xl w-full max-w-[96vw] 2xl:max-w-[1750px] max-h-[94vh] overflow-y-auto my-auto"
            >
              {/* Header Navigation & Close Button */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-30">
                {prevRoom && (
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(prevRoom)}
                    className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1C1A17] dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    title="Previous Residence"
                    aria-label="Previous Residence"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {nextRoom && (
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(nextRoom)}
                    className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1C1A17] dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    title="Next Residence"
                    aria-label="Next Residence"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1C1A17] dark:text-white flex items-center justify-center transition-all cursor-pointer ml-1 shadow-sm"
                  title="Close Details"
                  aria-label="Close Details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* The Exact Detailed Card View in Full-Width Scale */}
              <VillaDetailView
                room={selectedRoom}
                index={rooms.findIndex((r) => r.id === selectedRoom.id)}
                onBookClick={handleBookClick}
                onClose={() => setSelectedRoom(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
