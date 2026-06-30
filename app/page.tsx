"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Palmtree, Waves, Compass, Sparkles, MapPin, Mail, Phone } from "lucide-react"

import Hero from "@/components/shared/Hero"
import RoomCard, { Room } from "@/components/shared/RoomCard"
import BookingModal from "@/components/shared/BookingModal"

const MOCK_ROOMS: Room[] = [
  {
    id: "villa-1",
    name: "Luxury Garden Villa",
    description: "Nestled within our private botanical pathways, this villa features an outdoor stone tub, wooden rain shower, and a private hammock lounge.",
    pricePerNight: 8500,
    capacity: 2,
    imageUrl: "/room_villa.png",
    size: "55 sqm",
    amenities: ["Private Garden", "Outdoor Tub", "Espresso Bar", "King Bed"],
  },
  {
    id: "bungalow-1",
    name: "Overwater Bungalow Suite",
    description: "Hovering gracefully over the marine sanctuary, enjoy direct ocean access steps from your bed, glass floor viewing panel, and a private plunge pool.",
    pricePerNight: 15000,
    capacity: 4,
    imageUrl: "/room_overwater.png",
    size: "90 sqm",
    amenities: ["Ocean View", "Direct Sea Access", "Plunge Pool", "Glass Floor"],
  },
]

export default function Home() {
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const handleBookClick = (room: Room) => {
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner with Booking search bar */}
      <Hero />

      {/* Rooms Showcase Section */}
      <section id="rooms" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-widest text-secondary uppercase flex items-center justify-center gap-1.5 mb-2">
              <Palmtree className="h-4 w-4" /> Luxuriant Living
            </span>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
              Accommodations Crafted for Calm
            </h2>
            <p className="mt-4 text-muted-foreground font-light">
              Each space is designed in harmony with the environment, combining premium natural textures with modern organic utilities.
            </p>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {MOCK_ROOMS.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBookClick={handleBookClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Experience / Amenities Section */}
      <section id="amenities" className="py-24 bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold tracking-widest text-secondary uppercase flex items-center justify-center gap-1.5 mb-2">
              <Waves className="h-4 w-4" /> Amenities
            </span>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
              Sanctuary for the Senses
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Amenity 1 */}
            <div className="bg-background border border-border/60 p-8 rounded-2xl flex flex-col gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Waves className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Oceanfront Infinity Pool</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Swim at the edge of the horizon. Our heated infinity pool blends seamlessly with the ocean waves.
              </p>
            </div>

            {/* Amenity 2 */}
            <div className="bg-background border border-border/60 p-8 rounded-2xl flex flex-col gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Aromatherapy Spa</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Release all tension with customized deep-tissue massage treatments using locally sourced essential oils.
              </p>
            </div>

            {/* Amenity 3 */}
            <div className="bg-background border border-border/60 p-8 rounded-2xl flex flex-col gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Sunset Yacht Tour</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Cruise the crystal bays with our private catamaran and enjoy curated wine pairings as the sun meets the ocean.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Compass className="h-6 w-6 text-accent" />
                Tala Resort
              </span>
              <p className="text-sm text-primary-foreground/70 font-light max-w-xs">
                A premium tropical eco-resort sanctuary. Find peace, luxury, and absolute relaxation under the palm trees.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white">Contact Us</h4>
              <div className="flex flex-col gap-2.5 text-sm text-primary-foreground/80">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  El Nido, Palawan, Philippines
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent" />
                  +63 (917) 123 4567
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  hello@talaresort.com
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-primary-foreground/80">
                <a href="#rooms" className="hover:text-white transition-colors">Accommodations</a>
                <a href="#amenities" className="hover:text-white transition-colors">Amenities</a>
                <a href="#gallery" className="hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-foreground/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/60">
            <span>© {new Date().getFullYear()} Tala Resort Palawan. All rights reserved.</span>
            <span>Made with ❤ in the Philippines</span>
          </div>
        </div>
      </footer>

      {/* Booking Form Dialog Modal */}
      <BookingModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
