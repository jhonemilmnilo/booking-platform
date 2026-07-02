"use server"

import { z } from "zod"
import { differenceInDays, isBefore, startOfDay } from "date-fns"
import prisma from "@/lib/prisma/client"

// Mock rooms database for server-side rate calculation (Single Source of Truth)
const MOCK_ROOMS = [
  {
    id: "5br-6ba-private-pool-villa",
    name: "5BR/6BA Private Pool Villa",
    pricePerNight: 55000,
    capacity: 25,
  },
  {
    id: "3br-3ba-private-pool-villa",
    name: "3BR/3BA Private Pool Villa",
    pricePerNight: 41000,
    capacity: 20,
  },
  {
    id: "2br-2ba-private-pool-villa-a",
    name: "2BR/2BA Private Pool Villa A",
    pricePerNight: 21000,
    capacity: 8,
  },
  {
    id: "2br-2ba-private-pool-villa-b",
    name: "2BR/2BA Private Pool Villa B",
    pricePerNight: 23000,
    capacity: 10,
  },
  {
    id: "1br-1ba-private-pool-villa",
    name: "1BR/1BA Private Pool Villa",
    pricePerNight: 13000,
    capacity: 5,
  },
]

const bookingServerSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  guestPhone: z.string().optional(),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
})

export async function createBookingAction(formData: unknown) {
  const parsed = bookingServerSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { roomId, guestName, guestEmail, guestPhone, checkIn, checkOut } = parsed.data

  const checkInDate = startOfDay(new Date(checkIn))
  const checkOutDate = startOfDay(new Date(checkOut))
  const today = startOfDay(new Date())

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
  let roomName = ""
  let pricePerNight = 0

  try {
    const dbRoom = await prisma.room.findUnique({
      where: { id: roomId },
      select: { name: true, pricePerNight: true },
    })

    if (dbRoom) {
      roomName = dbRoom.name
      pricePerNight = dbRoom.pricePerNight
    } else {
      const mockRoom = MOCK_ROOMS.find((r) => r.id === roomId)
      if (!mockRoom) {
        return { success: false, error: "Selected room not found" }
      }
      roomName = mockRoom.name
      pricePerNight = mockRoom.pricePerNight
    }
  } catch (error) {
    console.error("[BookingAction] Database room lookup failed:", error)
    const mockRoom = MOCK_ROOMS.find((r) => r.id === roomId)
    if (!mockRoom) {
      return { success: false, error: "Selected room not found" }
    }
    roomName = mockRoom.name
    pricePerNight = mockRoom.pricePerNight
  }

  const totalPrice = pricePerNight * nights
  const bookingReference = `OHR-${Math.floor(100000 + Math.random() * 900000)}`

  try {
    const booking = await prisma.booking.create({
      data: {
        reference: bookingReference,
        roomId,
        guestName,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        roomName,
        pricePerNight,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        totalPrice,
        status: "CONFIRMED",
      },
    })

    return {
      success: true,
      data: {
        reference: booking.reference,
        roomName: booking.roomName,
        guestName: booking.guestName,
        nights: booking.nights,
        pricePerNight: booking.pricePerNight,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    }
  } catch (error) {
    console.error("[BookingAction] Database booking creation failed:", error)
    return { success: false, error: "Failed to confirm booking." }
  }
}

