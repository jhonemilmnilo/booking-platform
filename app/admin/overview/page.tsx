"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { getOverviewStatsAction } from "./action"
import { AdminSidebarToggle } from "@/app/admin/_components/admin-shell"
import AdminUserDropdown from "@/app/admin/_components/admin-user-dropdown"

interface RecentBooking {
  id: string
  reference: string
  guestName: string
  guestEmail: string | null
  roomName: string
  status: string
  totalPrice: number
  checkIn: Date | string
  checkOut: Date | string
  nights: number
  createdAt: Date | string
}

interface RoomPreview {
  id: string
  name: string
  pricePerNight: number
  capacity: number
  size: string
  imageUrl: string
}

interface ReviewPreview {
  id: string
  guestName: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: Date | string
}

interface OverviewData {
  activeBookings: number
  checkedIn: number
  completedCount: number
  cancelledCount: number
  totalBookings: number
  totalRevenue: number
  activePipelineRevenue: number
  pendingReviews: number
  totalUsers: number
  totalRooms: number
  recentBookings: RecentBooking[]
  rooms: RoomPreview[]
  recentReviews: ReviewPreview[]
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  CONFIRMED: {
    label: "Confirmed",
    badgeClass: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    dotClass: "bg-sky-400",
  },
  CHECKED_IN: {
    label: "Checked In",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    dotClass: "bg-emerald-400",
  },
  COMPLETED: {
    label: "Completed",
    badgeClass: "bg-white/10 text-white/70 border-white/20",
    dotClass: "bg-white/40",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    dotClass: "bg-rose-400",
  },
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`bg-black/[0.08] dark:bg-white/[0.05] rounded-xl animate-pulse ${className}`} />
}

export default function AdminOverviewPage() {
  const [data, setData] = React.useState<OverviewData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")

  const fetchData = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true)
    try {
      const res = await getOverviewStatsAction()
      if (res.success && res.data) {
        setData(res.data as OverviewData)
        setError(null)
      } else {
        setError(res.error ?? "Failed to load dashboard data.")
      }
    } catch (err) {
      console.error("[AdminOverview] Fetch error:", err)
      setError("An unexpected network error occurred while loading dashboard.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    let ignore = false
    getOverviewStatsAction()
      .then((res) => {
        if (ignore) return
        if (res.success && res.data) {
          setData(res.data as OverviewData)
          setError(null)
        } else {
          setError(res.error ?? "Failed to load dashboard data.")
        }
      })
      .catch((err) => {
        if (ignore) return
        console.error("[AdminOverview] Fetch error:", err)
        setError("An unexpected network error occurred while loading dashboard.")
      })
      .finally(() => {
        if (ignore) return
        setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(n)

  const formatDateSafely = (dateVal: Date | string, pattern = "MMM d, yyyy") => {
    try {
      const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal
      if (isNaN(d.getTime())) return "—"
      return format(d, pattern)
    } catch {
      return "—"
    }
  }

  // ── Skeleton Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
        {/* Top Header Skeleton */}
        <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AdminSidebarToggle />
            <div className="w-6 h-6 rounded bg-black/[0.08] dark:bg-white/10 animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-48 h-4 bg-black/[0.08] dark:bg-white/10 rounded animate-pulse" />
              <div className="w-36 h-2.5 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-24 h-8 rounded-xl bg-black/[0.08] dark:bg-white/10 animate-pulse" />
            <div className="w-32 h-8 rounded-xl bg-black/[0.08] dark:bg-white/10 animate-pulse" />
          </div>
        </header>

        <main className="w-full p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bone key={i} className="h-32 rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Bone className="h-96 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Bone className="h-64 rounded-2xl" />
            <Bone className="h-56 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  )
}

  // ── Error State ─────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="p-8 md:p-16 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <i className="fa-solid fa-triangle-exclamation text-xl text-rose-400"></i>
        </div>
        <h2 className="font-serif text-xl text-white mb-2">Unable to Load Dashboard</h2>
        <p className="text-sm text-white/50 max-w-md mb-6">{error ?? "Please check your network or credentials."}</p>
        <button
          onClick={() => {
            setIsLoading(true)
            fetchData()
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-luxury-gold text-white font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg"
        >
          <i className="fa-solid fa-arrow-rotate-right"></i>
          Retry
        </button>
      </div>
    )
  }

  // Filtered recent bookings
  const filteredBookings = data.recentBookings.filter((b) => {
    if (statusFilter === "ALL") return true
    return b.status === statusFilter
  })

  // Metric cards definitions
  const statCards = [
    {
      title: "Active Bookings",
      value: data.activeBookings,
      subtitle: "Awaiting arrival",
      icon: "fa-calendar-check",
      href: "/admin/bookings",
      badge: "Pending Check-In",
    },
    {
      title: "Checked In",
      value: data.checkedIn,
      subtitle: "Currently on-site",
      icon: "fa-door-open",
      href: "/admin/bookings",
      badge: "In Residence",
    },
    {
      title: "Realized Revenue",
      value: fmtCurrency(data.totalRevenue),
      subtitle: `${data.completedCount} completed stays`,
      icon: "fa-receipt",
      href: "/admin/ledger",
      badge: "Settled Ledger",
    },
    {
      title: "Active Pipeline",
      value: fmtCurrency(data.activePipelineRevenue),
      subtitle: "Upcoming & in-stay",
      icon: "fa-chart-line",
      href: "/admin/bookings",
      badge: "Committed",
    },
    {
      title: "Pending Reviews",
      value: data.pendingReviews,
      subtitle: "Guest stories to review",
      icon: "fa-star-half-stroke",
      href: "/admin/reviews",
      badge: data.pendingReviews > 0 ? "Action Required" : "All Approved",
    },
  ]

  const quickLinks = [
    {
      title: "Active Bookings",
      description: "Manage guest check-ins, departures, and reservation status",
      href: "/admin/bookings",
      icon: "fa-calendar-days",
    },
    {
      title: "Financial Ledger",
      description: "Audit completed stays, guest invoices, and revenue records",
      href: "/admin/ledger",
      icon: "fa-receipt",
    },
    {
      title: "Villas & Suites",
      description: "Update nightly rates, capacities, amenities, and photos",
      href: "/admin/rooms_suites",
      icon: "fa-hotel",
    },
    {
      title: "Guest Diaries",
      description: "Moderate guest photo albums, ratings, and testimonials",
      href: "/admin/reviews",
      icon: "fa-camera-retro",
    },
    {
      title: "Hero & Media Editor",
      description: "Customize hero headlines, video, and about showcase",
      href: "/admin/settings",
      icon: "fa-sliders",
    },
    {
      title: "Resort Amenities",
      description: "Manage luxury guest perks, experiences, and pool & spa hours",
      href: "/admin/amenities",
      icon: "fa-concierge-bell",
    },
    {
      title: "Location & Attractions",
      description: "Manage GPS map coordinates and nearby tourist guide",
      href: "/admin/location",
      icon: "fa-map-location-dot",
    },
    {
      title: "System & Brand",
      description: "Resort identity, theme accents, and contact information",
      href: "/admin/system",
      icon: "fa-gears",
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarToggle />
          <i className="fa-solid fa-chart-pie text-luxury-gold text-xl"></i>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-lg tracking-wider text-[#1C1A17] dark:text-white">Dashboard Overview</h1>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[9px] font-semibold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                Live Operations
              </div>
            </div>
            <p className="text-[10px] text-[#7A746B] dark:text-white/40 uppercase tracking-widest font-semibold">
              {format(new Date(), "EEEE, MMMM d, yyyy")} &bull; Real-time resort operations & occupancy
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] border border-black/10 dark:border-white/10 text-[#5C564F] dark:text-white/80 hover:text-[#1C1A17] dark:hover:text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            title="Refresh statistics"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs text-luxury-gold ${isRefreshing ? "fa-spin" : ""}`}></i>
            <span className="hidden sm:inline">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

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
      <main className="w-full p-6 md:p-10 space-y-8">

      {/* ── 5 Metric Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative bg-[#131418] hover:bg-[#181920] border border-white/[0.08] hover:border-luxury-gold/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Ambient hover glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-luxury-gold/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold truncate">
                  {card.title}
                </span>
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-luxury-gold/40 transition-colors">
                  <i className={`fa-solid ${card.icon} text-xs text-luxury-gold`}></i>
                </div>
              </div>

              <div className="font-serif text-2xl lg:text-[26px] font-bold text-white tracking-tight leading-none mb-1.5">
                {card.value}
              </div>
              <p className="text-[11px] text-white/40 truncate">{card.subtitle}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-white/60">
                {card.badge}
              </span>
              <i className="fa-solid fa-arrow-right text-[10px] text-white/20 group-hover:text-luxury-gold group-hover:translate-x-0.5 transition-all"></i>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Resort Operations Pulse Banner ──────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-luxury-gold/[0.08] via-white/[0.02] to-transparent border border-luxury-gold/20 p-5 lg:p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0">
              <i className="fa-solid fa-hotel text-lg"></i>
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg text-white font-medium">
                Resort Performance Snapshot
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Overview across {data.totalRooms} configured lodging villas and {data.totalUsers} registered guests.
              </p>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="border-l border-white/10 pl-4">
              <span className="text-[10px] text-white/40 uppercase tracking-widest block font-medium">
                Total Bookings
              </span>
              <span className="text-lg font-serif font-bold text-white">
                {data.totalBookings}
              </span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-[10px] text-white/40 uppercase tracking-widest block font-medium">
                Accommodations
              </span>
              <span className="text-lg font-serif font-bold text-white">
                {data.totalRooms} Units
              </span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-[10px] text-white/40 uppercase tracking-widest block font-medium">
                Registered Guests
              </span>
              <span className="text-lg font-serif font-bold text-white">
                {data.totalUsers}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid: Left (Recent Bookings) & Right (Quick Access + Rooms) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT COLUMN: Recent Reservations Feed (8 Cols) ── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#131418] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            {/* Header with Title & Filter Tabs */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="font-serif text-base font-semibold text-white tracking-wide flex items-center gap-2.5">
                  <i className="fa-solid fa-clock-rotate-left text-luxury-gold text-sm"></i>
                  Recent Guest Reservations
                </h3>
                <p className="text-[11px] text-white/45 mt-0.5">
                  Showing latest booking activity and on-site guest check-ins
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap shrink-0 no-scrollbar">
                {["ALL", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? "bg-luxury-gold text-white shadow"
                        : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {st === "ALL" ? "All" : st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                  <i className="fa-solid fa-folder-open text-white/20 text-xl"></i>
                </div>
                <p className="text-sm text-white/60 font-medium">No reservations match this filter</p>
                <p className="text-xs text-white/35 mt-1">
                  Change the status filter above or view the historical archive.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredBookings.map((b) => {
                  const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.CONFIRMED
                  // Get initials
                  const initials = b.guestName
                    ? b.guestName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "G"

                  return (
                    <div
                      key={b.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#17181e] hover:bg-[#1c1e26] border border-white/[0.04] hover:border-luxury-gold/30 transition-all duration-200 gap-4"
                    >
                      {/* Left: Avatar + Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center font-serif text-xs font-semibold text-luxury-gold shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-white truncate group-hover:text-luxury-gold transition-colors">
                              {b.guestName}
                            </span>
                            <span className="font-mono text-[10px] text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded">
                              #{b.reference}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-white/40 mt-1 flex-wrap">
                            <span className="text-white/70 font-medium truncate">{b.roomName}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <i className="fa-regular fa-calendar text-[10px] text-white/30"></i>
                              {formatDateSafely(b.checkIn, "MMM d")} &ndash; {formatDateSafely(b.checkOut, "MMM d, yyyy")}
                            </span>
                            {b.nights > 0 && (
                              <span className="text-[10px] text-white/35">({b.nights}n)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status + Total + Link */}
                      <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.04]">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${cfg.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          {cfg.label}
                        </span>

                        <div className="text-right">
                          <span className="text-xs font-serif font-bold text-luxury-gold block">
                            {fmtCurrency(b.totalPrice)}
                          </span>
                          <span className="text-[9px] text-white/30 block">Total stay</span>
                        </div>

                        <Link
                          href="/admin/bookings"
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-luxury-gold/20 hover:text-luxury-gold flex items-center justify-center text-white/40 transition-colors"
                          title="View in Bookings"
                        >
                          <i className="fa-solid fa-chevron-right text-[10px]"></i>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-white/40">
                Showing {filteredBookings.length} of {data.recentBookings.length} loaded records
              </span>
              <Link
                href="/admin/bookings"
                className="text-luxury-gold hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Go to Active Bookings</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* Pending Reviews Notice (if any) */}
          {data.pendingReviews > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                  <i className="fa-solid fa-bell text-sm"></i>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {data.pendingReviews} Guest Story {data.pendingReviews === 1 ? "Review" : "Reviews"} Awaiting Moderation
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Guests have submitted stay testimonials and photos for the public Guest Diaries section.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/reviews"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs tracking-wider uppercase hover:bg-amber-400 transition-all shrink-0"
              >
                Review Feedbacks
              </Link>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Quick Access & Villa Inventory (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Access Grid */}
          <div className="bg-[#131418] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-base font-semibold text-white tracking-wide flex items-center gap-2.5">
              <i className="fa-solid fa-bolt text-luxury-gold text-sm"></i>
              Quick Operations
            </h3>

            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between p-3 rounded-xl bg-[#17181e] hover:bg-[#1e2028] border border-white/[0.04] hover:border-luxury-gold/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] group-hover:border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0 transition-colors">
                      <i className={`fa-solid ${link.icon} text-xs`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                        {link.title}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">
                        {link.description}
                      </p>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-[10px] text-white/20 group-hover:text-luxury-gold group-hover:translate-x-0.5 transition-all shrink-0 ml-2"></i>
                </Link>
              ))}
            </div>
          </div>

          {/* Resort Villas Snapshot */}
          <div className="bg-[#131418] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-white tracking-wide flex items-center gap-2.5">
                <i className="fa-solid fa-hotel text-luxury-gold text-sm"></i>
                Villa Catalog
              </h3>
              <Link
                href="/admin/rooms_suites"
                className="text-[10px] text-luxury-gold hover:text-white uppercase tracking-wider font-semibold transition-colors"
              >
                Manage &rarr;
              </Link>
            </div>

            {data.rooms.length === 0 ? (
              <p className="text-xs text-white/40 italic py-4 text-center">No accommodations configured.</p>
            ) : (
              <div className="space-y-2.5">
                {data.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#17181e] border border-white/[0.04] gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {room.imageUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 relative shrink-0 border border-white/10">
                          <Image
                            src={room.imageUrl}
                            alt={room.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-luxury-gold shrink-0">
                          <i className="fa-solid fa-bed text-xs"></i>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{room.name}</p>
                        <p className="text-[10px] text-white/40">
                          Max {room.capacity} Guests &bull; {room.size || "Deluxe"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-serif font-semibold text-luxury-gold">
                        {fmtCurrency(room.pricePerNight)}
                      </span>
                      <span className="text-[9px] text-white/30 block">/ night</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  </div>
  )
}
