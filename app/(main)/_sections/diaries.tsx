"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { getApprovedReviewsAction, submitReviewAction } from "@/app/admin/reviews/actions"
import { getClientCachedReviews, setClientCachedReviews } from "@/lib/client-cache"

interface Review {
  id: string
  guestName: string
  rating: number
  stayDate: string | null
  comment: string
  videoUrl: string | null
  imageUrl: string | null
  createdAt: Date | string
}

export default function Diaries() {
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [activeReel, setActiveReel] = React.useState<string | null>(null)
  const [isSubmitOpen, setIsSubmitOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // Submit Form States
  const [guestName, setGuestName] = React.useState("")
  const [rating, setRating] = React.useState(5)
  const [stayDate, setStayDate] = React.useState("")
  const [comment, setComment] = React.useState("")
  const [videoFile, setVideoFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  // Track client mount for portal
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Hydrate immediately from client cache, then fetch fresh data from database
  React.useEffect(() => {
    const cached = getClientCachedReviews<Review>()
    if (cached && cached.length > 0) {
      setReviews(cached)
    }

    getApprovedReviewsAction()
      .then((data) => {
        if (data && Array.isArray(data)) {
          setReviews(data)
          setClientCachedReviews(data)
        }
      })
      .catch((err) => {
        console.warn("[Diaries] Failed to fetch approved reviews:", err)
      })
  }, [])

  // Lock body scroll and notify header when a reel or modal is open
  React.useEffect(() => {
    if (activeReel) {
      document.body.classList.add("reel-active")
      document.body.style.overflow = "hidden"
      window.dispatchEvent(new CustomEvent("sanctuary-reel-open"))
    } else {
      document.body.classList.remove("reel-active")
      window.dispatchEvent(new CustomEvent("sanctuary-reel-close"))
      if (!isSubmitOpen) {
        document.body.style.overflow = ""
      }
    }

    if (isSubmitOpen && !activeReel) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.classList.remove("reel-active")
      window.dispatchEvent(new CustomEvent("sanctuary-reel-close"))
      document.body.style.overflow = ""
    }
  }, [activeReel, isSubmitOpen])

  // Extract reels dynamically from reviews that have a videoUrl
  const reelsList = React.useMemo(() => {
    return reviews
      .filter((r) => Boolean(r.videoUrl))
      .map((r) => ({
        id: r.id,
        guestName: r.guestName,
        stayDate: r.stayDate || "Verified Stay",
        comment: r.comment,
        videoUrl: r.videoUrl!,
        imageUrl: r.imageUrl || null,
        rating: r.rating || 5,
      }))
  }, [reviews])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Enforce 5MB limit strictly (Project Rule #3)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      toast.error("Video exceeds 5MB limit. Please select a shorter or compressed clip.")
      e.target.value = ""
      setVideoFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      return
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed.")
      e.target.value = ""
      setVideoFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      return
    }

    setVideoFile(file)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleCancel = React.useCallback(() => {
    setIsSubmitOpen(false)
    setGuestName("")
    setRating(5)
    setStayDate("")
    setComment("")
    setVideoFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [previewUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim() || !comment.trim()) {
      toast.error("Name and comments are required.")
      return
    }

    setIsLoading(true)
    const toastId = toast.loading("Submitting your story...")

    try {
      const formData = new FormData()
      formData.append("guestName", guestName.trim())
      formData.append("rating", rating.toString())
      formData.append("stayDate", stayDate.trim())
      formData.append("comment", comment.trim())
      if (videoFile) {
        formData.append("file", videoFile)
      }

      const result = await submitReviewAction(formData)
      if (result.success) {
        toast.success("Story submitted! It will appear on the landing page once approved by our curation team.", { id: toastId })
        handleCancel()
      } else {
        toast.error(result.error || "Failed to submit review.", { id: toastId })
      }
    } catch (err) {
      console.error("[SubmitReview] Error:", err)
      toast.error("An error occurred during submission.", { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  const activeReelData = reelsList.find((r) => r.id === activeReel)

  return (
    <section id="diaries" className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-charcoal via-luxury-obsidian to-luxury-charcoal relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-luxury-gold/15 pb-8">
          <div className="space-y-4">
            <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block flex items-center gap-2">
              <span className="w-8 h-px bg-luxury-gold/40"></span>
              Guest Chronicles
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-luxury-cream leading-tight">
              The Private <br />
              <span className="bg-clip-text text-transparent text-gold-gradient italic">Sanctuary Diaries</span>
            </h2>
            <p className="text-xs md:text-sm text-luxury-cream/60 max-w-xl font-light leading-relaxed">
              Unfiltered memoirs and cinematic impressions shared by our distinguished guests from around the globe.
            </p>
          </div>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="self-start md:self-auto bg-gold-gradient hover:brightness-110 text-white font-bold text-xs uppercase tracking-[0.2em] py-3.5 px-8 rounded-full shadow-lg shadow-luxury-gold/20 active:scale-98 transition-all duration-300 border-none cursor-pointer flex items-center gap-2.5"
          >
            <i className="fa-solid fa-pen-nib text-xs"></i>
            <span>Share Your Story</span>
          </button>
        </div>

        {/* Cinematic Guest Reels Slider */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-film text-luxury-gold text-xs"></i>
              <h3 className="text-luxury-gold font-bold uppercase text-[11px] tracking-widest block">
                Cinematic Guest Reels
              </h3>
            </div>
            {reelsList.length > 0 && (
              <span className="text-[10px] text-luxury-cream/40 font-mono uppercase tracking-wider">
                {reelsList.length} {reelsList.length === 1 ? "Reel" : "Reels"} Live
              </span>
            )}
          </div>

          {reelsList.length > 0 ? (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory pt-2">
              {reelsList.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setActiveReel(reel.id)}
                  className="relative w-52 md:w-64 h-84 md:h-[420px] rounded-3xl overflow-hidden border border-luxury-gold/25 shadow-2xl snap-start shrink-0 cursor-pointer group bg-black transition-all duration-500 hover:border-luxury-gold/60 hover:-translate-y-1.5"
                >
                  {/* Looping Silent Video Preview */}
                  <video
                    src={reel.videoUrl}
                    poster={reel.imageUrl || undefined}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover filter brightness-[0.75] group-hover:scale-105 group-hover:brightness-95 transition-all duration-700"
                  />

                  {/* Gradient Backing */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none" />

                  {/* Rating Stars top-right */}
                  <div className="absolute top-4 right-4 flex gap-1 z-10 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-luxury-gold/20">
                    {Array.from({ length: reel.rating }).map((_, i) => (
                      <i key={i} className="fa-solid fa-crown text-luxury-gold text-[9px]"></i>
                    ))}
                  </div>

                  {/* Gold Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-gold-gradient text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-110 transition-all duration-300 border border-white/20">
                      <i className="fa-solid fa-play text-sm ml-0.5"></i>
                    </div>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end text-white z-10 space-y-1 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-10">
                    {/* White high-visibility poster name */}
                    <span className="font-serif text-base tracking-wide font-bold truncate text-white drop-shadow-md">
                      {reel.guestName}
                    </span>
                    <span className="text-[10px] text-luxury-gold font-bold tracking-widest uppercase flex items-center gap-1.5 drop-shadow-sm">
                      <i className="fa-regular fa-calendar-check text-[9px]"></i>
                      {reel.stayDate}
                    </span>
                    <p className="text-[11px] text-white/90 italic line-clamp-2 pt-1 font-light drop-shadow-sm">
                      &ldquo;{reel.comment}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-luxury-gold/20 rounded-3xl p-10 text-center text-luxury-cream/60 space-y-3">
              <i className="fa-solid fa-video text-3xl text-luxury-gold/50"></i>
              <p className="text-sm font-light">No video reels published yet.</p>
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="text-xs uppercase tracking-widest text-luxury-gold hover:underline font-semibold bg-transparent border-none cursor-pointer"
              >
                Be the first to upload a guest reel &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Guest Testimonials Feed Grid */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-quote-left text-luxury-gold text-xs"></i>
              <h3 className="text-luxury-gold font-bold uppercase text-[11px] tracking-widest block">
                Guest Testimonials
              </h3>
            </div>
            {reviews.length > 0 && (
              <span className="text-[10px] text-luxury-cream/40 font-mono uppercase tracking-wider">
                {reviews.length} Verified {reviews.length === 1 ? "Review" : "Reviews"}
              </span>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white/5 border border-luxury-gold/20 rounded-3xl p-12 text-center text-luxury-cream/60 space-y-4">
              <i className="fa-solid fa-feather text-4xl text-luxury-gold/40"></i>
              <p className="text-sm font-light">No sanctuary reviews published yet.</p>
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="bg-gold-gradient text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-full border-none cursor-pointer hover:brightness-110 transition-all shadow-md"
              >
                Share Your Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-white/5 border border-luxury-gold/20 hover:border-luxury-gold/50 rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-xl flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(212,175,55,0.12)] group"
                >
                  <div className="space-y-4">
                    {/* Crown Rating & Verified Stay */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <i key={i} className="fa-solid fa-crown text-luxury-gold text-xs"></i>
                        ))}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-[8px]"></i> Verified Stay
                      </span>
                    </div>

                    {/* Testimonial Quote - High contrast readable text */}
                    <p className="text-[#3A352F] dark:text-white/85 text-xs sm:text-sm font-light leading-relaxed italic line-clamp-5">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>

                  {/* Guest Meta Footer */}
                  <div className="flex items-end justify-between mt-6 pt-4 border-t border-luxury-gold/15">
                    <div>
                      {/* Crisp bold name with high contrast */}
                      <span className="font-serif text-sm sm:text-base font-bold text-[#1C1A17] dark:text-white block group-hover:text-luxury-gold transition-colors">
                        {item.guestName}
                      </span>
                      {item.stayDate && (
                        <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider block mt-0.5">
                          {item.stayDate}
                        </span>
                      )}
                    </div>

                    {item.videoUrl && (
                      <button
                        onClick={() => setActiveReel(item.id)}
                        className="text-[10px] text-luxury-gold hover:text-white hover:bg-luxury-gold uppercase tracking-wider font-semibold flex items-center gap-1.5 bg-luxury-gold/10 border border-luxury-gold/30 px-3 py-1 rounded-full transition-all cursor-pointer shadow-sm"
                        title="Watch guest reel video"
                      >
                        <i className="fa-solid fa-play text-[8px]"></i> Reel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Video Reels Modal (Portaled directly to document.body to break free of parent stacking contexts) */}
      {mounted && createPortal(
        <AnimatePresence>
          {activeReel && activeReelData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md z-[99999] flex items-center justify-center p-4 md:p-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveReel(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-xl border border-white/30 cursor-pointer transition-colors z-[100000] shadow-2xl"
                aria-label="Close reel"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-luxury-gold/30 bg-black"
              >
                <video
                  src={activeReelData.videoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Bottom Scrim with High-Contrast Pure White Name */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 sm:p-8 pt-20 text-white pointer-events-none space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* Bold Pure White Guest Name */}
                      <h4 className="font-serif text-lg sm:text-xl tracking-wide font-bold text-white drop-shadow-md">
                        {activeReelData.guestName}
                      </h4>
                      <span className="text-[10px] text-luxury-gold font-bold tracking-widest uppercase drop-shadow-sm flex items-center gap-1.5 mt-0.5">
                        <i className="fa-regular fa-calendar-check text-[9px]"></i>
                        {activeReelData.stayDate}
                      </span>
                    </div>
                    <div className="flex gap-1 drop-shadow-sm">
                      {Array.from({ length: activeReelData.rating }).map((_, i) => (
                        <i key={i} className="fa-solid fa-crown text-luxury-gold text-xs"></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-white text-xs sm:text-sm font-light leading-relaxed italic drop-shadow-sm pt-1">
                    &ldquo;{activeReelData.comment}&rdquo;
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Write a Review Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isSubmitOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-lg bg-[#16171b] border border-luxury-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-[#EAE5D9] max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-serif text-xl tracking-wider text-white">Share Your Sanctuary Diary</h3>
                    <p className="text-[10px] text-luxury-gold tracking-wider uppercase font-semibold">Curation Moderation Queue</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-sm border border-white/10 cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Guest Name */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">Guest Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Margaret Sterling"
                      className="w-full bg-[#0c0d0f] border border-white/10 focus:border-luxury-gold/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Rating Crown Picker */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">Experience Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setRating(stars)}
                          className="bg-transparent border-none cursor-pointer focus:outline-none"
                        >
                          <i className={`fa-solid fa-crown text-lg transition-transform hover:scale-110 ${stars <= rating ? "text-luxury-gold" : "text-white/20"}`}></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stay Date */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">Stay Date (Optional)</label>
                    <input
                      type="text"
                      value={stayDate}
                      onChange={(e) => setStayDate(e.target.value)}
                      placeholder="e.g. June 2026"
                      className="w-full bg-[#0c0d0f] border border-white/10 focus:border-luxury-gold/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">Diary Entry</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share details of your luxury getaway stay..."
                      className="w-full bg-[#0c0d0f] border border-white/10 focus:border-luxury-gold/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Clip Upload */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                      Attach Video Reel <span className="text-luxury-gold font-normal">(Max 5MB / MP4)</span>
                    </label>

                    {videoFile && previewUrl ? (
                      <div className="flex gap-4 items-center bg-[#0c0d0f] border border-luxury-gold/30 rounded-2xl p-3">
                        {/* Looping preview player */}
                        <div className="w-14 h-24 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black relative shadow-lg">
                          <video
                            src={previewUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="block text-[10px] font-semibold text-white truncate">{videoFile.name}</span>
                          <span className="block text-[9px] text-luxury-gold font-mono">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFile(null)
                              if (previewUrl) {
                                URL.revokeObjectURL(previewUrl)
                                setPreviewUrl(null)
                              }
                            }}
                            className="text-red-500 hover:text-red-400 bg-transparent border-none text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 p-0 mt-1"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i> Remove Video
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-[#0c0d0f] border border-white/10 rounded-xl p-3.5">
                        <input
                          type="file"
                          id="guestReelFile"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="guestReelFile"
                          className="bg-white/5 border border-white/10 hover:border-luxury-gold/50 hover:bg-luxury-gold/10 text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 w-full text-center"
                        >
                          <i className="fa-solid fa-cloud-arrow-up text-luxury-gold"></i> Choose Video Clip
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Submit button */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gold-gradient text-white hover:brightness-110 font-bold py-3 rounded-xl text-xs uppercase tracking-[0.2em] border-none cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin mr-1"></i> Submitting...
                        </>
                      ) : (
                        "Submit Entry"
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleCancel}
                      className="bg-white/5 hover:bg-white/10 text-white font-semibold px-6 rounded-xl text-xs border border-white/10 cursor-pointer transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </section>
  )
}
