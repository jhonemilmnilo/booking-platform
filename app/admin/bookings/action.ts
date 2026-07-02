"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import prisma from "@/lib/prisma/client"

const statusSchema = z.enum(["CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"])

export async function getActiveBookingsAction(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: {
          status: {
            in: ["CONFIRMED", "CHECKED_IN"],
          },
        },
        select: {
          id: true,
          reference: true,
          guestName: true,
          guestEmail: true,
          guestPhone: true,
          roomId: true,
          roomName: true,
          pricePerNight: true,
          checkIn: true,
          checkOut: true,
          nights: true,
          totalPrice: true,
          status: true,
          createdAt: true,
        },
        orderBy: { checkIn: "asc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({
        where: {
          status: {
            in: ["CONFIRMED", "CHECKED_IN"],
          },
        },
      }),
    ])

    return { success: true, data: { bookings, total, page, limit } }
  } catch (error) {
    console.error("[BookingsAction] Failed to retrieve active bookings:", error)
    return { success: false, error: "Failed to retrieve active bookings." }
  }
}

export async function getLedgerBookingsAction(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: {
          status: {
            in: ["COMPLETED", "CANCELLED"],
          },
        },
        select: {
          id: true,
          reference: true,
          guestName: true,
          guestEmail: true,
          guestPhone: true,
          roomId: true,
          roomName: true,
          pricePerNight: true,
          checkIn: true,
          checkOut: true,
          nights: true,
          totalPrice: true,
          status: true,
          createdAt: true,
        },
        orderBy: { checkOut: "desc" },
        skip,
        take: limit,
      }),
      prisma.booking.count({
        where: {
          status: {
            in: ["COMPLETED", "CANCELLED"],
          },
        },
      }),
    ])

    return { success: true, data: { bookings, total, page, limit } }
  } catch (error) {
    console.error("[BookingsAction] Failed to retrieve ledger bookings:", error)
    return { success: false, error: "Failed to retrieve ledger bookings." }
  }
}

export async function updateBookingStatusAction(bookingId: string, status: string) {
  try {
    const parsedStatus = statusSchema.safeParse(status)
    if (!parsedStatus.success) {
      return { success: false, error: "Invalid status value." }
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: parsedStatus.data },
      select: { id: true, reference: true, status: true },
    })

    revalidatePath("/admin/bookings")
    return { success: true, data: booking }
  } catch (error) {
    console.error("[BookingsAction] Failed to update booking status:", error)
    return { success: false, error: "Failed to update booking status." }
  }
}
