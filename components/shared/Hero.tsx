"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Users, Search } from "lucide-react"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "./DatePickerWithRange"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Hero() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  })
  const [guests, setGuests] = React.useState<string>("2")

  const handleSearch = () => {
    const roomsSection = document.getElementById("rooms")
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Green/Sand overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105"
        style={{ backgroundImage: `url('/resort_hero.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-background" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4"
        >
          <span className="text-sm font-semibold tracking-widest text-accent uppercase">
            Welcome to Paradise
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl max-w-3xl leading-[1.15]">
            Find Your Sanctuary at <span className="text-accent">Tala Resort</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-white/80 font-light md:text-xl">
            Escape the noise and immerse yourself in private beachside villas, crystal turquoise waters, and organic modern luxury.
          </p>
        </motion.div>

        {/* Floating Quick Book Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-4xl bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl p-4 md:p-6 border border-border/80 flex flex-col md:flex-row gap-4 items-center mt-4"
        >
          {/* Dates Picker */}
          <div className="flex-1 w-full text-left flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Check-In & Check-Out
            </span>
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>

          {/* Guests Count Selector */}
          <div className="w-full md:w-48 text-left flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Guests
            </span>
            <Select value={guests} onValueChange={(val) => setGuests(val || "2")}>
              <SelectTrigger className="h-11 border-border/80 text-foreground bg-background">
                <Users className="h-4 w-4 text-primary mr-2" />
                <SelectValue placeholder="Guests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Guest</SelectItem>
                <SelectItem value="2">2 Guests</SelectItem>
                <SelectItem value="3">3 Guests</SelectItem>
                <SelectItem value="4">4 Guests</SelectItem>
                <SelectItem value="5">5+ Guests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="w-full md:w-auto self-end">
            <Button 
              onClick={handleSearch}
              className="w-full md:w-auto h-11 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center justify-center gap-2 rounded-xl"
            >
              <Search className="h-4 w-4" />
              Explore Rooms
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
