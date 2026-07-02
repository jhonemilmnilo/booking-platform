"use client"

import * as React from "react"
import { createBookingAction } from "@/app/actions/booking"
import { toast } from "sonner"

interface InquiryProps {
  selectedVilla: string;
  setSelectedVilla: (val: string) => void;
  securityTier: string;
  setSecurityTier: (val: string) => void;
  customRequests: string;
  setCustomRequests: (val: string) => void;
  heroCheckIn: string;
  heroGuests: string;
}

export default function Inquiry({
  selectedVilla,
  setSelectedVilla,
  securityTier,
  setSecurityTier,
  customRequests,
  setCustomRequests,
  heroCheckIn,
  heroGuests,
}: InquiryProps) {
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [addon, setAddon] = React.useState("Private Airport Shuttle Only")
  const [duration, setDuration] = React.useState("3 Nights")
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  interface SuccessData {
    reference: string;
    roomName: string;
    guestName: string;
    nights: number;
    totalPrice: number;
  }

  const [successData, setSuccessData] = React.useState<SuccessData | null>(null)

  // Handle Inquiry/Booking Submission
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted) {
      toast.error("Please certify that your details are correct first.")
      return
    }

    setIsSubmitting(true)

    try {
      let checkInDate = new Date()
      if (heroCheckIn) {
        checkInDate = new Date(heroCheckIn)
      } else {
        checkInDate.setDate(checkInDate.getDate() + 1) // Tomorrow
      }

      const nightsCount = duration === "3 Nights" ? 3 : duration === "7 Nights" ? 7 : 14
      const checkOutDate = new Date(checkInDate)
      checkOutDate.setDate(checkInDate.getDate() + nightsCount)

      const guestsCount = heroGuests.includes("1") ? 1 : heroGuests.includes("2") ? 2 : heroGuests.includes("4") ? 4 : 6

      const result = await createBookingAction({
        roomId: selectedVilla,
        guestName: fullName,
        guestEmail: email,
        guestPhone: phone || "N/A - Checked Via Portal",
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guestsCount: guestsCount,
      })

      if (result.success && result.data) {
        setSuccessData({
          reference: result.data.reference,
          roomName: result.data.roomName,
          guestName: result.data.guestName,
          nights: result.data.nights,
          totalPrice: result.data.totalPrice,
        })
        toast.success("Resort inquiry dossier transferred successfully!")
      } else {
        toast.error(result.error || "Failed to submit booking inquiry.")
      }
    } catch (err) {
      console.error("[InquiryForm] Submit error:", err)
      toast.error("An unexpected error occurred during submission.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="inquiry" className="py-24 md:py-36 px-6 md:px-12 bg-luxury-obsidian relative">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-luxury-charcoal to-luxury-obsidian border border-luxury-gold rounded-3xl p-8 md:p-12 relative overflow-hidden gold-glow">
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-luxury-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-luxury-gold/5 rounded-full blur-3xl"></div>

        <div className="space-y-8 text-center mb-10">
          <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Resort Reservation Access</span>
          <h2 className="font-serif text-3xl md:text-5xl text-luxury-cream">
            Bespoke <span className="text-gold-gradient italic">Reservation Request</span>
          </h2>
          <p className="text-luxury-cream/60 text-sm max-w-lg mx-auto leading-relaxed">
            Ocean Hill Resort operates on curated guest access. Complete our inquiry form to verify availability, and our private concierge will contact you within 2 hours.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleInquirySubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                Full Guest Name
              </label>
              <input
                type="text"
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Sir Sebastian Thorne"
                className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all placeholder:text-luxury-cream/35"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                Secure Correspondence Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., guest@eminent.com"
                className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all placeholder:text-luxury-cream/35"
              />
            </div>

            {/* Secure Phone Input */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                Secure Contact Phone
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +30 210 555 9821"
                className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all placeholder:text-luxury-cream/35"
              />
            </div>

            {/* Preferred Villa */}
            <div className="space-y-2">
              <label htmlFor="villaSelect" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                Select Preferred Suite / Villa
              </label>
              <select
                id="villaSelect"
                value={selectedVilla}
                onChange={(e) => setSelectedVilla(e.target.value)}
                className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all cursor-pointer"
              >
                <option value="royal-suite">The Beachfront Royal Suite</option>
                <option value="garden-villa">The Beachfront Garden Villa</option>
                <option value="lagoon-suite">The Oceanview Lagoon Suite</option>
              </select>
            </div>

            {/* Transit addons */}
            <div className="space-y-2">
              <label htmlFor="addonSelect" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                Resort & Transit Addons
              </label>
              <select
                id="addonSelect"
                value={addon}
                onChange={(e) => setAddon(e.target.value)}
                className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all cursor-pointer"
              >
                <option value="Private Airport Shuttle Only">Private Airport Shuttle Only</option>
                <option value="Beachfront Cabana Package">Beachfront Cabana Package</option>
                <option value="All-Inclusive VIP Beach Club Access">All-Inclusive VIP Beach Club Access</option>
                <option value="None">No Transit Assistance Needed</option>
              </select>
            </div>

            {/* Duration of Stay */}
            <div className="space-y-2">
              <label htmlFor="duration" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                Duration of Resort Stay
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all cursor-pointer"
              >
                <option value="3 Nights">3 Nights (Weekend Rest)</option>
                <option value="7 Nights">7 Nights (Full Retreat)</option>
                <option value="14+ Nights">14+ Nights (Extended Getaway)</option>
              </select>
            </div>

            {/* Curation tier */}
            <div className="space-y-2">
              <label htmlFor="securityTier" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
                Guest Curation Level Needed
              </label>
              <select
                id="securityTier"
                value={securityTier}
                onChange={(e) => setSecurityTier(e.target.value)}
                className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all cursor-pointer"
              >
                <option value="Standard Resort Guest">Standard Resort Guest</option>
                <option value="VIP Beach Club Access">VIP Beach Club Access</option>
                <option value="Presidential All-Inclusive Access">Presidential All-Inclusive Access</option>
              </select>
            </div>
          </div>

          {/* Custom Request Text */}
          <div className="space-y-2">
            <label htmlFor="customRequests" className="text-luxury-gold uppercase tracking-[0.15em] text-[10px] font-bold block">
              Personal Curation Requests / Dietaries
            </label>
            <textarea
              id="customRequests"
              rows={3}
              value={customRequests}
              onChange={(e) => setCustomRequests(e.target.value)}
              placeholder="Specify dining desires, private cabana requests, or bespoke room arrangements..."
              className="w-full bg-luxury-charcoal border border-luxury-cream/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-all placeholder:text-luxury-cream/35"
            ></textarea>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 text-xs text-luxury-cream/50 pt-2 select-none">
            <input
              type="checkbox"
              id="termsCheck"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="accent-luxury-gold mt-1 cursor-pointer"
            />
            <label htmlFor="termsCheck" className="cursor-pointer">
              I certify that the information provided is correct. I authorize Ocean Hill Resort guest relation services to contact me directly for stay curation.
            </label>
          </div>

          {/* Dispatch Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold-gradient text-luxury-obsidian font-bold text-xs uppercase tracking-[0.25em] py-4.5 rounded-xl shadow-2xl transition-all duration-300 hover:brightness-110 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i> Dispatching Inquiry Dossier...
              </>
            ) : (
              <>
                <i className="fa-solid fa-file-signature"></i> Dispatch VIP Invitation Request
              </>
            )}
          </button>
        </form>

        {/* Success state receipt overlay */}
        {successData && (
          <div className="absolute inset-0 bg-luxury-obsidian/95 flex flex-col items-center justify-center p-8 text-center space-y-6 z-20 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-luxury-gold/10 border border-luxury-gold flex items-center justify-center text-luxury-gold text-4xl animate-bounce">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <h3 className="font-serif text-3xl text-luxury-cream">Dispatch Successful</h3>
            <p className="text-luxury-cream/80 text-sm max-w-md leading-relaxed">
              Thank you, <strong>{successData.guestName}</strong>. Your inquiry dossier has been transferred securely via encrypted protocols to our private vetting panel. Expect correspondence at <strong>{email}</strong> inside the hour.
            </p>
            <div className="p-4 bg-luxury-charcoal rounded-xl border border-luxury-gold/20 text-left w-full max-w-sm">
              <h5 className="font-bold text-[10px] tracking-widest text-luxury-gold uppercase mb-2">Resort Itinerary Voucher:</h5>
              <div className="text-[11px] space-y-1 text-luxury-cream/80">
                <div>
                  <strong className="text-luxury-cream">Booking Reference:</strong> <span className="font-mono text-luxury-gold">{successData.reference}</span>
                </div>
                <div>
                  <strong className="text-luxury-cream">Suite/Villa:</strong> <span>{successData.roomName}</span>
                </div>
                <div>
                  <strong className="text-luxury-cream">Assigned Concierge:</strong> <span className="text-luxury-lightGold">Elena Vance</span>
                </div>
                <div>
                  <strong className="text-luxury-cream">Curation Level:</strong> <span>{securityTier}</span>
                </div>
                <div>
                  <strong className="text-luxury-cream">Total calculated:</strong> <span>₱{successData.totalPrice.toLocaleString()} ({successData.nights} Nights)</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSuccessData(null)
                setFullName("")
                setEmail("")
                setPhone("")
                setCustomRequests("")
                setTermsAccepted(false)
              }}
              className="border border-luxury-gold/60 text-luxury-cream font-bold text-[10px] tracking-widest uppercase px-6 py-2.5 rounded-full hover:bg-luxury-gold/10 transition-all cursor-pointer"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
