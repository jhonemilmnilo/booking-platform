"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Users, Maximize2, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export interface Room {
  id: string
  name: string
  description: string
  pricePerNight: number
  capacity: number
  imageUrl: string
  size: string
  amenities: string[]
}

interface RoomCardProps {
  room: Room
  onBookClick: (room: Room) => void
}

export default function RoomCard({ room, onBookClick }: RoomCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="overflow-hidden border border-border/60 bg-card h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={room.imageUrl}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm border border-border/40 px-3 py-1 rounded-full text-xs font-semibold text-primary">
            ₱{room.pricePerNight.toLocaleString()} / night
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6 flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              {room.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {room.description}
            </p>

            {/* Room Info Specs */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary" />
                Up to {room.capacity} Guests
              </span>
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5 text-primary" />
                {room.size}
              </span>
            </div>

            {/* Amenities Badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {room.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 text-secondary" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => onBookClick(room)}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl"
          >
            Request Booking
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
