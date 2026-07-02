"use client"

import * as React from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  getActiveBookingsAction,
  updateBookingStatusAction,
} from "./action"

interface Booking {
  id: string
  reference: string
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  roomId: string
  roomName: string
  pricePerNight: number
  checkIn: Date | string
  checkOut: Date | string
  nights: number
  totalPrice: number
  status: string
  createdAt: Date | string
}

export default function BookingsAdminPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null)

  // Active bookings state
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)

  const itemsPerPage = 10

  const loadActiveBookings = React.useCallback((pageNumber: number) => {
    getActiveBookingsAction(pageNumber, itemsPerPage)
      .then((res) => {
        if (res.success && res.data) {
          setBookings(res.data.bookings as Booking[])
          setTotal(res.data.total)
          setPage(res.data.page)
        } else {
          toast.error(res.error || "Failed to load active bookings.")
        }
      })
      .catch((err) => {
        console.error("[AdminBookings] Error loading active bookings:", err)
        toast.error("Failed to load active bookings.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Initial load
  React.useEffect(() => {
    loadActiveBookings(page)
  }, [page, loadActiveBookings])

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setIsUpdating(bookingId)
    try {
      const res = await updateBookingStatusAction(bookingId, newStatus)
      if (res.success && res.data) {
        toast.success(`Booking status updated to ${newStatus.replace("_", " ")}`)
        loadActiveBookings(page)
      } else {
        toast.error(res.error || "Failed to update status.")
      }
    } catch (err) {
      console.error("[AdminBookings] Status update error:", err)
      toast.error("An error occurred during updating status.")
    } finally {
      setIsUpdating(null)
    }
  }

  // Format date helper
  const formatDateString = (dateVal: Date | string) => {
    try {
      return format(new Date(dateVal), "MMM dd, yyyy")
    } catch {
      return String(dateVal)
    }
  }

  const totalPages = Math.ceil(total / itemsPerPage)

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((p) => p - 1)
      setIsLoading(true)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((p) => p + 1)
      setIsLoading(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#EAE5D9] font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-[#D4AF37]/20 bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-receipt text-[#D4AF37] text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-white">Guest Bookings</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Active Reservations Manager</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/50">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-[#D4AF37]"></i>
            <span className="text-xs uppercase tracking-widest font-semibold">Retrieving Reservations...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="border border-[#D4AF37]/10 bg-white/5 rounded-3xl p-16 text-center max-w-lg mx-auto mt-12">
            <i className="fa-solid fa-receipt text-5xl text-[#D4AF37]/35 mb-4 block"></i>
            <h3 className="font-serif text-xl text-white font-semibold mb-2">No Bookings Found</h3>
            <p className="text-xs text-white/50">
              There are currently no active or pending reservations.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="overflow-x-auto border border-[#D4AF37]/10 rounded-2xl bg-white/5 shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D4AF37]/10 bg-black/40 text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Ref Code</th>
                    <th className="px-6 py-4">Guest Information</th>
                    <th className="px-6 py-4">Lodging Villa</th>
                    <th className="px-6 py-4">Check-In / Out</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                      {/* Reference Badge */}
                      <td className="px-6 py-4 font-mono font-bold text-[#D4AF37]">
                        {booking.reference}
                      </td>

                      {/* Guest Details */}
                      <td className="px-6 py-4 space-y-1">
                        <div className="font-semibold text-white">{booking.guestName}</div>
                        {(booking.guestEmail || booking.guestPhone) && (
                          <div className="text-[10px] text-white/40 flex flex-col">
                            {booking.guestEmail && (
                              <span>
                                <i className="fa-regular fa-envelope mr-1"></i>
                                {booking.guestEmail}
                              </span>
                            )}
                            {booking.guestPhone && (
                              <span className="mt-0.5">
                                <i className="fa-solid fa-phone mr-1"></i>
                                {booking.guestPhone}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Villa Booked */}
                      <td className="px-6 py-4 font-medium text-white/80">
                        {booking.roomName}
                      </td>

                      {/* Check-In / Out Dates */}
                      <td className="px-6 py-4 space-y-0.5">
                        <div className="text-white/80 font-medium">
                          {formatDateString(booking.checkIn)} - {formatDateString(booking.checkOut)}
                        </div>
                        <div className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">
                          {booking.nights} {booking.nights === 1 ? "Night" : "Nights"}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 font-bold text-white">
                        ₱{booking.totalPrice.toLocaleString()}
                        <span className="text-[9px] text-white/40 font-normal block mt-0.5">
                          ₱{booking.pricePerNight.toLocaleString()}/night
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            booking.status === "CONFIRMED"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {booking.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isUpdating === booking.id ? (
                            <i className="fa-solid fa-spinner fa-spin text-[#D4AF37] py-1 px-3"></i>
                          ) : (
                            <>
                              {booking.status === "CONFIRMED" && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(booking.id, "CHECKED_IN")}
                                    className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                                  >
                                    Check In
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {booking.status === "CHECKED_IN" && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                                    className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                                  >
                                    Checkout / Complete
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                  Showing {(page - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(page * itemsPerPage, total)} of {total} reservations
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="border border-[#D4AF37]/20 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="border border-[#D4AF37]/20 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
