"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  getPendingReviewsAction,
  getApprovedReviewsAction,
  approveReviewAction,
  deleteReviewAction
} from "./actions"
import { AdminSidebarToggle } from "@/app/admin/_components/admin-shell"
import AdminUserDropdown from "@/app/admin/_components/admin-user-dropdown"

interface Review {
  id: string
  guestName: string
  rating: number
  stayDate: string | null
  comment: string
  videoUrl: string | null
  imageUrl: string | null
  createdAt: Date
}

export default function AdminReviewsPage() {
  const [pendingReviews, setPendingReviews] = React.useState<Review[]>([])
  const [approvedReviews, setApprovedReviews] = React.useState<Review[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<"pending" | "approved">("pending")

  React.useEffect(() => {
    let active = true
    async function load() {
      try {
        const [pending, approved] = await Promise.all([
          getPendingReviewsAction(),
          getApprovedReviewsAction()
        ])
        if (active) {
          setPendingReviews(pending)
          setApprovedReviews(approved)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("[AdminReviews] Error loading data:", err)
        toast.error("Failed to load reviews data.")
        if (active) {
          setIsLoading(false)
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const res = await approveReviewAction(id)
      if (res.success) {
        toast.success("Review approved successfully.")
        // Refresh lists
        const approvedItem = pendingReviews.find((r) => r.id === id)
        if (approvedItem) {
          setPendingReviews((prev) => prev.filter((r) => r.id !== id))
          setApprovedReviews((prev) => [
            { ...approvedItem, isApproved: true },
            ...prev
          ])
        }
      } else {
        toast.error(res.error || "Failed to approve review.")
      }
    } catch (err) {
      console.error("[AdminReviews] Approve error:", err)
      toast.error("An error occurred during approval.")
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Are you sure you want to permanently delete this review entry and its associated media?")
    if (!confirmed) return

    try {
      const res = await deleteReviewAction(id)
      if (res.success) {
        toast.success("Review deleted successfully.")
        setPendingReviews((prev) => prev.filter((r) => r.id !== id))
        setApprovedReviews((prev) => prev.filter((r) => r.id !== id))
      } else {
        toast.error(res.error || "Failed to delete review.")
      }
    } catch (err) {
      console.error("[AdminReviews] Delete error:", err)
      toast.error("An error occurred during deletion.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
        {/* Top Navbar Skeleton */}
        <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AdminSidebarToggle />
            <div className="w-6 h-6 rounded bg-black/[0.08] dark:bg-white/10 animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-48 h-4 bg-black/[0.08] dark:bg-white/10 rounded animate-pulse" />
              <div className="w-36 h-2.5 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-32 h-8 rounded-xl bg-black/[0.08] dark:bg-white/10 animate-pulse" />
        </header>

        <main className="w-full px-6 md:px-10 mt-8 space-y-8">
          {/* Toggle Tabs Skeleton */}
          <div className="flex border-b border-black/10 dark:border-white/10 pb-1 gap-6">
            <div className="w-40 h-6 bg-black/[0.08] dark:bg-white/10 rounded-t animate-pulse" />
            <div className="w-40 h-6 bg-black/[0.05] dark:bg-white/5 rounded-t animate-pulse" />
          </div>

          {/* Review Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-6 animate-pulse shadow-sm dark:shadow-xl"
              >
                <div className="space-y-4">
                  {/* Rating crowns & date skeleton */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <div key={starIdx} className="w-3.5 h-3.5 rounded-full bg-black/[0.08] dark:bg-white/10" />
                      ))}
                    </div>
                    <div className="w-20 h-3 bg-black/[0.08] dark:bg-white/10 rounded" />
                  </div>

                  {/* Comment text skeleton */}
                  <div className="space-y-2">
                    <div className="w-full h-3.5 bg-white/10 rounded" />
                    <div className="w-5/6 h-3.5 bg-white/10 rounded" />
                    <div className="w-3/4 h-3.5 bg-white/5 rounded" />
                  </div>
                </div>

                {/* Footer / Author & actions skeleton */}
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="w-28 h-4 bg-white/10 rounded" />
                    <div className="w-20 h-2.5 bg-white/5 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 h-8 bg-white/10 rounded-xl" />
                    <div className="w-16 h-8 bg-white/10 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
      
      {/* Top Navbar */}
      <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarToggle />
          <i className="fa-solid fa-camera-retro text-luxury-gold text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-[#1C1A17] dark:text-white">Guest Diaries Moderation</h1>
            <p className="text-[10px] text-[#7A746B] dark:text-white/40 uppercase tracking-widest font-semibold">Curation and Reviews Approval</p>
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

      <main className="w-full px-6 md:px-10 mt-8 space-y-8">
        
        {/* Toggle Tabs */}
        <div className="flex border-b border-white/10 pb-1 gap-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === "pending"
                ? "border-luxury-gold text-white"
                : "border-transparent text-white/40 hover:text-white/60"
            }`}
          >
            Pending Approval ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === "approved"
                ? "border-luxury-gold text-white"
                : "border-transparent text-white/40 hover:text-white/60"
            }`}
          >
            Approved & Live ({approvedReviews.length})
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {activeTab === "pending" ? (
            pendingReviews.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-white/40">
                <i className="fa-solid fa-circle-check text-4xl text-luxury-gold/45 mb-4"></i>
                <p className="text-sm font-light">All submitted reviews have been moderated. Curation queue is empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => handleApprove(review.id)}
                    onDelete={() => handleDelete(review.id)}
                    showActions
                  />
                ))}
              </div>
            )
          ) : approvedReviews.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-white/40">
              <i className="fa-solid fa-folder-open text-4xl text-white/20 mb-4"></i>
              <p className="text-sm font-light">No approved reviews are currently live on the website.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onDelete={() => handleDelete(review.id)}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

interface ReviewCardProps {
  review: Review
  onApprove?: () => void
  onDelete: () => void
  showActions: boolean
}

function ReviewCard({ review, onApprove, onDelete, showActions }: ReviewCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-luxury-gold/30 transition-all duration-300">
      <div className="space-y-4">
        {/* Rating and Meta */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: review.rating }).map((_, i) => (
              <i key={i} className="fa-solid fa-crown text-luxury-gold text-xs"></i>
            ))}
          </div>
          <span className="text-[10px] text-white/40 font-mono">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Comment Text */}
        <p className="text-sm font-light text-white/80 leading-relaxed italic">
          &ldquo;{review.comment}&rdquo;
        </p>

        {/* Embedded Video Clip Preview if exists */}
        {review.videoUrl && (
          <div className="space-y-2">
            <span className="block text-[9px] uppercase tracking-wider font-bold text-luxury-gold">Uploaded Guest Reel</span>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] w-full max-w-[200px] bg-black mx-auto">
              <video
                src={review.videoUrl}
                controls
                preload="metadata"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Guest Signature / Footer */}
      <div className="border-t border-white/10 pt-4 flex items-center justify-between">
        <div>
          <span className="block text-sm font-semibold text-white">{review.guestName}</span>
          {review.stayDate && (
            <span className="text-[10px] text-white/40 font-medium">Stayed: {review.stayDate}</span>
          )}
        </div>

        {/* Moderation Controls */}
        <div className="flex gap-2">
          {showActions && onApprove && (
            <button
              onClick={onApprove}
              className="bg-gold-gradient text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border-none cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <i className="fa-solid fa-circle-check mr-1"></i> Approve
            </button>
          )}
          <button
            onClick={onDelete}
            className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            <i className="fa-solid fa-trash-can mr-1"></i> {showActions ? "Reject" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
