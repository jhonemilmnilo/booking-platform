"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  getPendingReviewsAction,
  getApprovedReviewsAction,
  approveReviewAction,
  toggleReviewApprovalAction,
  deleteReviewAction,
  createAdminReviewAction
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
  isApproved?: boolean
  createdAt: Date | string
}

export default function AdminReviewsPage() {
  const [pendingReviews, setPendingReviews] = React.useState<Review[]>([])
  const [approvedReviews, setApprovedReviews] = React.useState<Review[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<"approved" | "pending">("approved")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Add Review Modal State
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [newGuestName, setNewGuestName] = React.useState("")
  const [newRating, setNewRating] = React.useState(5)
  const [newStayDate, setNewStayDate] = React.useState("")
  const [newComment, setNewComment] = React.useState("")
  const [newVideoUrl, setNewVideoUrl] = React.useState("")
  const [newImageUrl, setNewImageUrl] = React.useState("")
  const [newVideoFile, setNewVideoFile] = React.useState<File | null>(null)
  const [newIsApproved, setNewIsApproved] = React.useState(true)

  // Custom Delete Confirmation Modal State
  const [reviewToDelete, setReviewToDelete] = React.useState<Review | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const loadData = React.useCallback(async () => {
    try {
      const [pending, approved] = await Promise.all([
        getPendingReviewsAction(),
        getApprovedReviewsAction()
      ])
      setPendingReviews(pending)
      setApprovedReviews(approved)
    } catch (err) {
      console.error("[AdminReviews] Error loading data:", err)
      toast.error("Failed to load reviews data.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleApprove = async (id: string) => {
    try {
      const res = await approveReviewAction(id)
      if (res.success) {
        toast.success("Review approved and published to live diaries.")
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

  const handleUnapprove = async (id: string) => {
    try {
      const res = await toggleReviewApprovalAction(id, false)
      if (res.success) {
        toast.success("Review moved back to pending moderation.")
        const item = approvedReviews.find((r) => r.id === id)
        if (item) {
          setApprovedReviews((prev) => prev.filter((r) => r.id !== id))
          setPendingReviews((prev) => [
            { ...item, isApproved: false },
            ...prev
          ])
        }
      } else {
        toast.error(res.error || "Failed to unpublish review.")
      }
    } catch (err) {
      console.error("[AdminReviews] Unapprove error:", err)
      toast.error("An error occurred.")
    }
  }

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return

    setIsDeleting(true)
    const toastId = toast.loading("Deleting review...")

    try {
      const res = await deleteReviewAction(reviewToDelete.id)
      if (res.success) {
        toast.success("Review deleted successfully.", { id: toastId })
        const deletedId = reviewToDelete.id
        setPendingReviews((prev) => prev.filter((r) => r.id !== deletedId))
        setApprovedReviews((prev) => prev.filter((r) => r.id !== deletedId))
        setReviewToDelete(null)
      } else {
        toast.error(res.error || "Failed to delete review.", { id: toastId })
      }
    } catch (err) {
      console.error("[AdminReviews] Delete error:", err)
      toast.error("An error occurred during deletion.", { id: toastId })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGuestName.trim() || !newComment.trim()) {
      toast.error("Guest name and comment are required.")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Saving diary review...")

    try {
      const formData = new FormData()
      formData.append("guestName", newGuestName.trim())
      formData.append("rating", newRating.toString())
      formData.append("stayDate", newStayDate.trim())
      formData.append("comment", newComment.trim())
      formData.append("isApproved", newIsApproved ? "true" : "false")
      if (newVideoUrl.trim()) formData.append("videoUrl", newVideoUrl.trim())
      if (newImageUrl.trim()) formData.append("imageUrl", newImageUrl.trim())
      if (newVideoFile) formData.append("file", newVideoFile)

      const res = await createAdminReviewAction(formData)
      if (res.success && res.data) {
        toast.success(newIsApproved ? "Review published live!" : "Review saved as pending!", { id: toastId })
        setIsAddOpen(false)
        // Reset form
        setNewGuestName("")
        setNewRating(5)
        setNewStayDate("")
        setNewComment("")
        setNewVideoUrl("")
        setNewImageUrl("")
        setNewVideoFile(null)
        setNewIsApproved(true)

        // Reload data
        loadData()
      } else {
        toast.error(res.error || "Failed to create review.", { id: toastId })
      }
    } catch (err) {
      console.error("[AdminReviews] Create error:", err)
      toast.error("An unexpected error occurred.", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter reviews by search query
  const filteredApproved = approvedReviews.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPending = pendingReviews.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
      
      {/* Top Navbar */}
      <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarToggle />
          <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold text-lg">
            <i className="fa-solid fa-camera-retro"></i>
          </div>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-[#1C1A17] dark:text-white">Guest Diaries Moderation</h1>
            <p className="text-[10px] text-[#7A746B] dark:text-white/40 uppercase tracking-widest font-semibold">
              Live Curation, Cinematic Reels & Testimonials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gold-gradient hover:brightness-110 px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all duration-200 uppercase tracking-wider border-none"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span className="hidden sm:inline">Add Guest Story</span>
          </button>

          <Link
            href="/#diaries"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C564F] dark:text-white/80 hover:text-luxury-gold transition-all duration-200 border border-black/10 dark:border-white/10 hover:border-luxury-gold/50 rounded-xl px-3.5 py-2.5 bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            <span className="hidden sm:inline">View Live Section</span>
          </Link>

          <AdminUserDropdown />
        </div>
      </header>

      <main className="w-full px-6 md:px-10 mt-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Search & Tabs Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("approved")}
              className={`pb-2 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "approved"
                  ? "border-luxury-gold text-luxury-gold font-bold"
                  : "border-transparent text-black/50 dark:text-white/40 hover:text-black/80 dark:hover:text-white/70"
              }`}
            >
              <span>Live & Approved</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${activeTab === "approved" ? "bg-luxury-gold text-white" : "bg-black/10 dark:bg-white/10"}`}>
                {approvedReviews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-2 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "pending"
                  ? "border-luxury-gold text-luxury-gold font-bold"
                  : "border-transparent text-black/50 dark:text-white/40 hover:text-black/80 dark:hover:text-white/70"
              }`}
            >
              <span>Pending Moderation</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${pendingReviews.length > 0 ? "bg-amber-500 text-white" : "bg-black/10 dark:bg-white/10"}`}>
                {pendingReviews.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40 dark:text-white/40 pointer-events-none"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest or quote..."
              className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl pl-9 pr-4 py-2 text-xs text-[#1C1A17] dark:text-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : activeTab === "approved" ? (
          filteredApproved.length === 0 ? (
            <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-16 text-center text-black/40 dark:text-white/40 space-y-4">
              <i className="fa-solid fa-folder-open text-4xl text-luxury-gold/40"></i>
              <p className="text-sm font-light">No approved reviews found matching your filter.</p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="bg-gold-gradient text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-full border-none cursor-pointer hover:brightness-110 shadow-md"
              >
                Add Your First Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApproved.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onUnapprove={() => handleUnapprove(review.id)}
                  onDelete={() => setReviewToDelete(review)}
                  isApproved={true}
                />
              ))}
            </div>
          )
        ) : (
          filteredPending.length === 0 ? (
            <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-16 text-center text-black/40 dark:text-white/40 space-y-3">
              <i className="fa-solid fa-circle-check text-4xl text-emerald-500/50"></i>
              <p className="text-sm font-light">All submitted reviews have been moderated. Curation queue is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPending.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprove={() => handleApprove(review.id)}
                  onDelete={() => setReviewToDelete(review)}
                  isApproved={false}
                />
              ))}
            </div>
          )
        )}

      </main>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {reviewToDelete && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white dark:bg-[#16171b] border border-red-500/20 dark:border-red-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-[#1C1A17] dark:text-[#EAE5D9]"
            >
              {/* Header Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-xl shrink-0">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1C1A17] dark:text-white">
                    Delete Guest Story?
                  </h3>
                  <p className="text-xs text-[#7A746B] dark:text-white/60 leading-relaxed font-light">
                    Are you sure you want to permanently delete this review entry and its associated media? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Review Snippet Preview */}
              <div className="bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xs font-bold text-[#1C1A17] dark:text-white">
                    {reviewToDelete.guestName}
                  </span>
                  {reviewToDelete.stayDate && (
                    <span className="text-[9px] text-luxury-gold font-bold uppercase tracking-wider">
                      {reviewToDelete.stayDate}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C564F] dark:text-white/70 italic line-clamp-2">
                  &ldquo;{reviewToDelete.comment}&rdquo;
                </p>
                {reviewToDelete.videoUrl && (
                  <div className="flex items-center gap-1.5 text-[10px] text-luxury-gold font-medium pt-1">
                    <i className="fa-solid fa-film text-[9px]"></i> Includes attached video reel
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setReviewToDelete(null)}
                  className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#5C564F] dark:text-white/80 font-semibold px-5 py-2.5 rounded-xl text-xs border border-black/10 dark:border-white/10 cursor-pointer transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteReview}
                  className="bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-red-500/25 border-none cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash-can"></i>
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Review / Reel Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#16171b] border border-luxury-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#1C1A17] dark:text-[#EAE5D9] max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <h3 className="font-serif text-lg tracking-wider font-semibold text-[#1C1A17] dark:text-white">
                  Add Guest Story / Reel
                </h3>
                <p className="text-[10px] text-luxury-gold uppercase tracking-widest font-semibold">
                  Publish directly to Sanctuary Diaries
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/60 dark:text-white flex items-center justify-center text-sm border-none cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Guest Name */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-black/70 dark:text-white/60 mb-1.5">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Lady Genevieve Vance"
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d0f] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-2.5 text-xs text-[#1C1A17] dark:text-white focus:outline-none"
                />
              </div>

              {/* Rating Crown Picker */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-black/70 dark:text-white/60 mb-1.5">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setNewRating(stars)}
                      className="bg-transparent border-none cursor-pointer p-0"
                    >
                      <i className={`fa-solid fa-crown text-lg transition-transform hover:scale-110 ${stars <= newRating ? "text-luxury-gold" : "text-black/20 dark:text-white/20"}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stay Date */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-black/70 dark:text-white/60 mb-1.5">
                  Stay Date
                </label>
                <input
                  type="text"
                  value={newStayDate}
                  onChange={(e) => setNewStayDate(e.target.value)}
                  placeholder="e.g. June 2026"
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d0f] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-2.5 text-xs text-[#1C1A17] dark:text-white focus:outline-none"
                />
              </div>

              {/* Testimonial Comment */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-black/70 dark:text-white/60 mb-1.5">
                  Diary Entry / Comment *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter guest feedback, review, or resort impression..."
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d0f] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-2.5 text-xs text-[#1C1A17] dark:text-white focus:outline-none resize-none"
                />
              </div>

              {/* Video URL or File Upload */}
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-black/70 dark:text-white/60">
                  Video Reel Clip (Optional)
                </label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Direct video URL, e.g. /videos/enhance_ocean_hill_villas_mobile.mp4"
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d0f] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-2 text-xs text-[#1C1A17] dark:text-white focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-black/40 dark:text-white/40 uppercase">Or upload file (max 5MB):</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setNewVideoFile(e.target.files?.[0] || null)}
                    className="text-xs text-black/60 dark:text-white/60 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-luxury-gold/10 file:text-luxury-gold hover:file:bg-luxury-gold/20"
                  />
                </div>
              </div>

              {/* Poster / Image URL */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-black/70 dark:text-white/60 mb-1.5">
                  Thumbnail / Poster Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="e.g. /images/image7.webp"
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d0f] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-2.5 text-xs text-[#1C1A17] dark:text-white focus:outline-none"
                />
              </div>

              {/* Immediate Approval Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="immediateApprove"
                  checked={newIsApproved}
                  onChange={(e) => setNewIsApproved(e.target.checked)}
                  className="w-4 h-4 rounded text-luxury-gold focus:ring-luxury-gold cursor-pointer"
                />
                <label htmlFor="immediateApprove" className="text-xs font-semibold cursor-pointer">
                  Publish immediately (Approved & Live on Website)
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gold-gradient text-white hover:brightness-110 font-bold py-3 rounded-xl text-xs uppercase tracking-widest border-none cursor-pointer transition-all disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? "Saving..." : "Create & Save"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddOpen(false)}
                  className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/70 dark:text-white font-semibold px-6 rounded-xl text-xs border-none cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

interface ReviewCardProps {
  review: Review
  onApprove?: () => void
  onUnapprove?: () => void
  onDelete: () => void
  isApproved: boolean
}

function ReviewCard({ review, onApprove, onUnapprove, onDelete, isApproved }: ReviewCardProps) {
  return (
    <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-luxury-gold/40 transition-all duration-300 shadow-sm dark:shadow-xl">
      <div className="space-y-4">
        {/* Rating and Meta */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: review.rating }).map((_, i) => (
              <i key={i} className="fa-solid fa-crown text-luxury-gold text-xs"></i>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {isApproved ? (
              <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Live on Site
              </span>
            ) : (
              <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Pending Approval
              </span>
            )}
            <span className="text-[10px] text-black/40 dark:text-white/40 font-mono">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Comment Text */}
        <p className="text-sm font-light text-black/80 dark:text-white/80 leading-relaxed italic">
          &ldquo;{review.comment}&rdquo;
        </p>

        {/* Embedded Video Clip Preview if exists */}
        {review.videoUrl && (
          <div className="space-y-2 pt-1">
            <span className="block text-[9px] uppercase tracking-wider font-bold text-luxury-gold">
              Guest Reel Video
            </span>
            <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 aspect-[9/16] w-full max-w-[200px] bg-black mx-auto shadow-md">
              <video
                src={review.videoUrl}
                poster={review.imageUrl || undefined}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Guest Signature / Footer */}
      <div className="border-t border-black/10 dark:border-white/10 pt-4 flex items-center justify-between">
        <div>
          <span className="block text-sm font-semibold text-[#1C1A17] dark:text-white font-serif">{review.guestName}</span>
          {review.stayDate && (
            <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider">
              {review.stayDate}
            </span>
          )}
        </div>

        {/* Moderation Controls */}
        <div className="flex gap-2">
          {!isApproved && onApprove && (
            <button
              onClick={onApprove}
              className="bg-gold-gradient text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border-none cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <i className="fa-solid fa-circle-check mr-1"></i> Approve
            </button>
          )}

          {isApproved && onUnapprove && (
            <button
              onClick={onUnapprove}
              className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/60 dark:text-white/60 font-semibold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 cursor-pointer active:scale-95 transition-all"
            >
              <i className="fa-solid fa-eye-slash mr-1"></i> Unpublish
            </button>
          )}

          <button
            onClick={onDelete}
            className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 font-bold text-[10px] uppercase tracking-widest px-3.5 py-2 rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            <i className="fa-solid fa-trash-can mr-1"></i> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
