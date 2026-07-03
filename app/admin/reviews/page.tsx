"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  getPendingReviewsAction,
  getApprovedReviewsAction,
  approveReviewAction,
  deleteReviewAction
} from "./actions"

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
  const router = useRouter()
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
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-[#D4AF37]"></i>
          <span className="text-sm tracking-widest uppercase font-semibold text-white/60">Retrieving Diaries Queue...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#EAE5D9] font-sans pb-16">
      
      {/* Top Navbar */}
      <header className="border-b border-[#D4AF37]/20 bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-camera-retro text-[#D4AF37] text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-white">Guest Diaries Moderation</h1>
            <p className="text-[10px] text-white/50 tracking-widest uppercase font-bold">Curation and Reviews Approval</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs font-semibold hover:text-[#D4AF37] transition-colors border border-white/10 hover:border-[#D4AF37]/50 rounded-full px-4 py-2 bg-white/5 cursor-pointer"
        >
          <i className="fa-solid fa-chevron-left"></i> View Live Site
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 space-y-8">
        
        {/* Toggle Tabs */}
        <div className="flex border-b border-white/10 pb-1 gap-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === "pending"
                ? "border-[#D4AF37] text-white"
                : "border-transparent text-white/40 hover:text-white/60"
            }`}
          >
            Pending Approval ({pendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === "approved"
                ? "border-[#D4AF37] text-white"
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
                <i className="fa-solid fa-circle-check text-4xl text-[#D4AF37]/45 mb-4"></i>
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
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-[#D4AF37]/30 transition-all duration-300">
      <div className="space-y-4">
        {/* Rating and Meta */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: review.rating }).map((_, i) => (
              <i key={i} className="fa-solid fa-crown text-[#D4AF37] text-xs"></i>
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
            <span className="block text-[9px] uppercase tracking-wider font-bold text-[#D4AF37]">Uploaded Guest Reel</span>
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
              className="bg-gold-gradient text-luxury-obsidian font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border-none cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md"
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
