"use server"

import { z } from "zod"
import { differenceInDays, isBefore, startOfDay } from "date-fns"

// Mock rooms database for server-side rate calculation (Single Source of Truth)
const MOCK_ROOMS = [
  {
    id: "villa-1",
    name: "Luxury Garden Villa",
    pricePerNight: 8500,
    capacity: 2,
  },
  {
    id: "bungalow-1",
    name: "Overwater Bungalow Suite",
    pricePerNight: 15000,
    capacity: 4,
  },
]

const bookingServerSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().min(7, "Invalid phone number"),
  checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid check-in date"),
  checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid check-out date"),
  guestsCount: z.number().min(1, "At least 1 guest required"),
})

export type BookingInput = z.infer<typeof bookingServerSchema>

export async function createBookingAction(formData: BookingInput) {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Validate inputs on server
  const parsed = bookingServerSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed: " + parsed.error.issues.map((i) => i.message).join(", "),
    }
  }

  const { roomId, guestName, checkIn, checkOut } = parsed.data
  const checkInDate = startOfDay(new Date(checkIn))
  const checkOutDate = startOfDay(new Date(checkOut))
  const today = startOfDay(new Date())

  // Date Logic validation
  if (isBefore(checkInDate, today)) {
    return { success: false, error: "Check-in date cannot be in the past" }
  }

  if (isBefore(checkOutDate, checkInDate)) {
    return { success: false, error: "Check-out date must be after check-in date" }
  }

  const nights = differenceInDays(checkOutDate, checkInDate)
  if (nights < 1) {
    return { success: false, error: "Stay duration must be at least 1 night" }
  }

  // Server-controlled pricing calculation
  const room = MOCK_ROOMS.find((r) => r.id === roomId)
  if (!room) {
    return { success: false, error: "Selected room not found" }
  }

  const totalPrice = room.pricePerNight * nights
  const bookingReference = `TALA-${Math.floor(100000 + Math.random() * 900000)}`

  return {
    success: true,
    data: {
      reference: bookingReference,
      roomName: room.name,
      guestName,
      nights,
      pricePerNight: room.pricePerNight,
      totalPrice,
      status: "CONFIRMED", // Directly confirmed because PayMongo is bypassed for now
    },
  }
}
