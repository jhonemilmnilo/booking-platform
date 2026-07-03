"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { getApprovedReviewsAction, submitReviewAction } from "@/app/admin/reviews/actions"

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

// Public royalty-free vertical video loops for premium showcase fallback
const MOCK_REELS = [
  {
    id: "mock-1",
    guestName: "Alessandra Rossi",
    stayDate: "May 2026",
    comment: "Breathtaking views and top-tier hospitality. The private infinity pool is unmatched.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-beach-and-ocean-waves-aerial-view-34282-large.mp4"
  },
  {
    id: "mock-2",
    guestName: "Julian Vance",
    stayDate: "June 2026",
    comment: "Simply paradise. Waking up to the sea waves is something I will never forget.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-resort-swimming-pool-with-palm-trees-43187-large.mp4"
  },
  {
    id: "mock-3",
    guestName: "Clara Dupont",
    stayDate: "April 2026",
    comment: "Bespoke privileges made our honeymoon feel so magical. 10/10 curation.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-luxury-resort-overwater-bungalows-42247-large.mp4"
  }
]

export default function Diaries() {
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [activeReel, setActiveReel] = React.useState<string | null>(null)
  const [isSubmitOpen, setIsSubmitOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  
  // Submit Form States
  const [guestName, setGuestName] = React.useState("")
  const [rating, setRating] = React.useState(5)
  const [stayDate, setStayDate] = React.useState("")
  const [comment, setComment] = React.useState("")
  const [videoFile, setVideoFile] = React.useState<File | null>(null)

  // Fetch live reviews
  const loadReviews = React.useCallback(() => {
    getApprovedReviewsAction()
      .then((data) => {
        setReviews(data)
      })
      .catch((err) => {
        console.warn("Failed to fetch approved reviews:", err)
      })
  }, [])

  React.useEffect(() => {
    loadReviews()
  }, [loadReviews])

  // Combine live reviews with video urls and fallbacks
  const reelsList = React.useMemo(() => {
    const liveReels = reviews
      .filter((r) => r.videoUrl)
      .map((r) => ({
        id: r.id,
        guestName: r.guestName,
        stayDate: r.stayDate || "Recently",
        comment: r.comment,
        videoUrl: r.videoUrl!
      }))
    
    return liveReels.length > 0 ? liveReels : MOCK_REELS
  }, [reviews])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Enforce 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      toast.error("Video exceeds 5MB limit. Please select a shorter or optimized clip.")
      e.target.value = ""
      setVideoFile(null)
      return
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed.")
      e.target.value = ""
      setVideoFile(null)
      return
    }

    setVideoFile(file)
  }

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
      formData.append("guestName", guestName)
      formData.append("rating", rating.toString())
      formData.append("stayDate", stayDate)
      formData.append("comment", comment)
      if (videoFile) {
        formData.append("file", videoFile)
      }

      const result = await submitReviewAction(formData)
      if (result.success) {
        toast.success("Story submitted! It will appear on the landing page once approved by our curation team.", { id: toastId })
        setIsSubmitOpen(false)
        setGuestName("")
        setRating(5)
        setStayDate("")
        setComment("")
        setVideoFile(null)
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
    <section id="diaries" className="py-24 md:py-36 px-6 md:px-12 bg-gradient-to-b from-luxury-charcoal to-luxury-obsidian relative">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Guest Chronicles</span>
            <h2 className="font-serif text-3xl md:text-5xl text-luxury-cream leading-tight">
              The Ocean Hill <br />
              <span className="text-gold-gradient italic">Sanctuary Diaries</span>
            </h2>
          </div>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="self-start md:self-auto bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-bold text-xs uppercase tracking-[0.2em] py-3.5 px-8 rounded-full shadow-lg active:scale-98 transition-all duration-300 border-none cursor-pointer"
          >
            Share Your Story <i className="fa-solid fa-pen-nib ml-2"></i>
          </button>
        </div>

        {/* Video Reels Slide Row */}
        <div className="space-y-4">
          <h3 className="text-luxury-gold font-bold uppercase text-[10px] tracking-widest block">Cinematic Guest Reels</h3>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
            {reelsList.map((reel) => (
              <div
                key={reel.id}
                onClick={() => setActiveReel(reel.id)}
                className="relative w-48 md:w-60 h-80 md:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden border border-luxury-gold/15 shadow-xl snap-start shrink-0 cursor-pointer group bg-black"
              >
                <video
                  src={reel.videoUrl}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition-transform duration-750"
                />
                
                {/* Gold Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient text-luxury-obsidian flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <i className="fa-solid fa-play text-sm ml-0.5"></i>
                  </div>
                </div>

                {/* Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="font-serif text-sm tracking-wide font-semibold truncate">{reel.guestName}</span>
                  <span className="text-[9px] text-[#D4AF37] font-semibold tracking-wider uppercase">{reel.stayDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Text Reviews Feed Grid */}
        <div className="space-y-4 pt-6">
          <h3 className="text-luxury-gold font-bold uppercase text-[10px] tracking-widest block">Guest Testimonials</h3>
          {reviews.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Default Mock Testimonials */}
              {MOCK_REELS.map((item, idx) => (
                <div key={idx} className="bg-white border border-luxury-gold/15 rounded-3xl p-6 shadow-md flex flex-col justify-between h-48 md:h-52">
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className="fa-solid fa-crown text-[#D4AF37] text-[10px]"></i>
                      ))}
                    </div>
                    <p className="text-luxury-cream/80 text-xs md:text-sm font-light leading-relaxed italic line-clamp-3">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-serif text-xs md:text-sm font-bold text-luxury-cream">{item.guestName}</span>
                    <span className="text-[9px] text-luxury-gold/80 font-bold uppercase tracking-wider">{item.stayDate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((item) => (
                <div key={item.id} className="bg-white border border-luxury-gold/15 rounded-3xl p-6 shadow-md flex flex-col justify-between min-h-[180px]">
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <i key={i} className="fa-solid fa-crown text-[#D4AF37] text-[10px]"></i>
                      ))}
                    </div>
                    <p className="text-luxury-cream/80 text-xs md:text-sm font-light leading-relaxed italic">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-luxury-gold/10">
                    <span className="font-serif text-xs md:text-sm font-bold text-luxury-cream">{item.guestName}</span>
                    {item.stayDate && (
                      <span className="text-[9px] text-luxury-gold/80 font-bold uppercase tracking-wider">{item.stayDate}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Video Reels Modal */}
      <AnimatePresence>
        {activeReel && activeReelData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6"
          >
            <button
              onClick={() => setActiveReel(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg border-none cursor-pointer transition-colors z-50"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-luxury-gold/25"
            >
              <video
                src={activeReelData.videoUrl}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 text-white pointer-events-none space-y-2">
                <div>
                  <h4 className="font-serif text-lg tracking-wide font-semibold">{activeReelData.guestName}</h4>
                  <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest uppercase">{activeReelData.stayDate}</span>
                </div>
                <p className="text-white/80 text-xs font-light leading-relaxed">
                  &ldquo;{activeReelData.comment}&rdquo;
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isSubmitOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#16171b] border border-luxury-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-[#EAE5D9]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl tracking-wider text-white">Share Your Sanctuary Diary</h3>
                  <p className="text-[10px] text-white/40 tracking-wider uppercase font-semibold">Curation Moderation Queue</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
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
                        <i className={`fa-solid fa-crown text-lg transition-transform hover:scale-110 ${stars <= rating ? "text-[#D4AF37]" : "text-white/20"}`}></i>
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
                    Attach Video Reel <span className="text-luxury-gold">(Max 5MB / MP4)</span>
                  </label>
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
                      className="bg-white/5 border border-white/10 hover:border-luxury-gold/50 hover:bg-luxury-gold/10 text-white font-semibold py-2 px-4 rounded-lg text-[10px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                    >
                      <i className="fa-solid fa-cloud-arrow-up text-luxury-gold"></i> Select Video
                    </label>
                    <span className="text-[10px] text-white/40 truncate flex-1">
                      {videoFile ? videoFile.name : "No file chosen"}
                    </span>
                    {videoFile && (
                      <button
                        type="button"
                        onClick={() => setVideoFile(null)}
                        className="text-red-500 hover:text-red-400 bg-transparent border-none text-[10px] font-semibold uppercase tracking-widest cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gold-gradient text-luxury-obsidian hover:brightness-110 font-bold py-3 rounded-xl text-xs uppercase tracking-[0.2em] border-none cursor-pointer transition-all disabled:opacity-50"
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
                    onClick={() => setIsSubmitOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-white font-semibold px-6 rounded-xl text-xs border border-white/10 cursor-pointer transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  )
}
