"use server"

import prisma from "@/lib/prisma/client"

export async function getOverviewStatsAction() {
  try {
    const [
      activeBookings,
      checkedIn,
      completedCount,
      cancelledCount,
      totalBookings,
      revenueCompleted,
      revenueActive,
      pendingReviews,
      totalUsers,
      totalRooms,
      recentBookings,
      rooms,
      recentReviews,
    ] = await Promise.all([
      // Counts
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "CHECKED_IN" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.count(),

      // Revenue: Realized (Completed)
      prisma.booking.aggregate({
        where: { status: "COMPLETED" },
        _sum: { totalPrice: true },
      }),

      // Revenue: Active pipeline (Confirmed + Checked In)
      prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } },
        _sum: { totalPrice: true },
      }),

      // Reviews & Users & Rooms
      prisma.review.count({ where: { isApproved: false } }),
      prisma.user.count(),
      prisma.room.count(),

      // Recent Bookings (with full context for luxury UI)
      prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reference: true,
          guestName: true,
          guestEmail: true,
          roomName: true,
          checkIn: true,
          checkOut: true,
          nights: true,
          status: true,
          totalPrice: true,
          createdAt: true,
        },
      }),

      // Rooms preview for inventory awareness
      prisma.room.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          pricePerNight: true,
          capacity: true,
          size: true,
          imageUrl: true,
        },
      }),

      // Recent guest reviews preview
      prisma.review.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          guestName: true,
          rating: true,
          comment: true,
          isApproved: true,
          createdAt: true,
        },
      }),
    ])

    return {
      success: true,
      data: {
        activeBookings,
        checkedIn,
        completedCount,
        cancelledCount,
        totalBookings,
        totalRevenue: revenueCompleted._sum.totalPrice ?? 0,
        activePipelineRevenue: revenueActive._sum.totalPrice ?? 0,
        pendingReviews,
        totalUsers,
        totalRooms,
        recentBookings,
        rooms,
        recentReviews,
      },
    }
  } catch (error) {
    console.error("[OverviewAction] Failed to fetch overview statistics:", error)
    return { success: false, error: "Failed to load overview data." }
  }
}
