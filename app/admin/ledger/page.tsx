"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  getLedgerBookingsAction,
} from "@/app/admin/bookings/action"
import { AdminSidebarToggle } from "@/app/admin/_components/admin-shell"
import AdminUserDropdown from "@/app/admin/_components/admin-user-dropdown"

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

export default function BookingLedgerPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  // Ledger bookings state
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)

  const itemsPerPage = 10

  const loadLedgerBookings = React.useCallback((pageNumber: number) => {
    getLedgerBookingsAction(pageNumber, itemsPerPage)
      .then((res) => {
        if (res.success && res.data) {
          setBookings(res.data.bookings as Booking[])
          setTotal(res.data.total)
          setPage(res.data.page)
        } else {
          toast.error(res.error || "Failed to load ledger bookings.")
        }
      })
      .catch((err) => {
        console.error("[AdminLedger] Error loading ledger bookings:", err)
        toast.error("Failed to load ledger bookings.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Initial load & page updates
  React.useEffect(() => {
    loadLedgerBookings(page)
  }, [page, loadLedgerBookings])


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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarToggle />
          <i className="fa-solid fa-clock-rotate-left text-luxury-gold text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-[#1C1A17] dark:text-white">Booking Ledger</h1>
            <p className="text-[10px] text-[#7A746B] dark:text-white/40 uppercase tracking-widest font-semibold">Historical Reservations Archive</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C564F] dark:text-white/80 hover:text-luxury-gold transition-all duration-200 border border-black/10 dark:border-white/10 hover:border-luxury-gold/50 rounded-xl px-3.5 py-2 bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            <span className="hidden sm:inline">View Live Site</span>
          </Link>

          <AdminUserDropdown />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full p-6 md:p-10 space-y-6">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Desktop Skeleton Table */}
            <div className="hidden md:block overflow-x-auto border border-black/10 dark:border-luxury-gold/10 rounded-2xl bg-white dark:bg-white/5 shadow-sm dark:shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-luxury-gold/10 bg-black/[0.03] dark:bg-black/40 text-[10px] text-luxury-gold font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Ref Code</th>
                    <th className="px-6 py-4">Guest Information</th>
                    <th className="px-6 py-4">Lodging Villa</th>
                    <th className="px-6 py-4">Check-In / Out</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="w-20 h-4 bg-black/[0.08] dark:bg-white/10 rounded" />
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="w-32 h-3.5 bg-black/[0.08] dark:bg-white/10 rounded" />
                        <div className="w-40 h-2.5 bg-black/[0.05] dark:bg-white/5 rounded" />
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="w-36 h-3.5 bg-black/[0.08] dark:bg-white/10 rounded" />
                        <div className="w-16 h-2.5 bg-black/[0.05] dark:bg-white/5 rounded" />
                      </td>
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="w-28 h-3.5 bg-black/[0.08] dark:bg-white/10 rounded" />
                        <div className="w-14 h-2.5 bg-black/[0.05] dark:bg-white/5 rounded" />
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="w-20 h-4 bg-black/[0.08] dark:bg-white/10 rounded" />
                        <div className="w-12 h-2.5 bg-black/[0.05] dark:bg-white/5 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-6 bg-black/[0.08] dark:bg-white/10 rounded-full" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="w-16 h-7 bg-black/[0.08] dark:bg-white/10 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Skeleton Cards */}
            <div className="md:hidden space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-black/10 dark:border-luxury-gold/10 rounded-2xl p-5 bg-white dark:bg-white/5 space-y-4 animate-pulse shadow-sm dark:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 bg-black/[0.08] dark:bg-white/10 rounded" />
                    <div className="w-20 h-5 bg-black/[0.08] dark:bg-white/10 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-36 h-4 bg-black/[0.08] dark:bg-white/10 rounded" />
                    <div className="w-48 h-3 bg-black/[0.05] dark:bg-white/5 rounded" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="w-20 h-4 bg-black/[0.08] dark:bg-white/10 rounded" />
                    <div className="w-20 h-7 bg-black/[0.08] dark:bg-white/10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="border border-luxury-gold/10 bg-white/5 rounded-3xl p-16 text-center max-w-lg mx-auto mt-12">
            <i className="fa-solid fa-clock-rotate-left text-5xl text-luxury-gold/35 mb-4 block"></i>
            <h3 className="font-serif text-xl text-white font-semibold mb-2">No Archives Found</h3>
            <p className="text-xs text-white/50">
              No completed or cancelled history found in the database ledger.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Table View */}
            <div className="overflow-x-auto border border-luxury-gold/10 rounded-2xl bg-white/5 shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-luxury-gold/10 bg-black/40 text-[10px] text-luxury-gold font-semibold uppercase tracking-wider">
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
                      <td className="px-6 py-4 font-mono font-bold text-luxury-gold">
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
                        <div className="text-[10px] text-luxury-gold font-semibold uppercase tracking-wider">
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
                            booking.status === "COMPLETED"
                              ? "bg-white/10 text-white/60 border border-white/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {booking.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold py-1">
                            Archived
                          </span>
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
                  {Math.min(page * itemsPerPage, total)} of {total} ledger entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="border border-luxury-gold/20 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-luxury-gold px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="border border-luxury-gold/20 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-luxury-gold px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed"
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
