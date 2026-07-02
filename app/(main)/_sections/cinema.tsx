"use client"

import * as React from "react"
import Image from "next/image"

const CAMPAIGN_REELS = [
  {
    tag: "Ad Feature: Sunset Horizon",
    title: "Campaign Reel I: Coastal Sunrise",
    duration: "14 sec Loop",
    previewUrl: "/images/image3.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-luxury-resort-swimming-pool-under-palm-trees-42521-large.mp4"
  },
  {
    tag: "Ad Feature: Sea Sanctuary",
    title: "Campaign Reel II: Lagoon Splendor",
    duration: "18 sec Loop",
    previewUrl: "/images/image6.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-villa-with-swimming-pool-and-palm-trees-during-sunset-42520-large.mp4"
  },
  {
    tag: "Ad Feature: Champagne Dusk",
    title: "Campaign Reel III: Seaside Sunset",
    duration: "11 sec Loop",
    previewUrl: "/images/image5.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-crystal-clear-swimming-pool-by-the-sea-40502-large.mp4"
  }
]

export default function Cinema() {
  const [activeCampaignIndex, setActiveCampaignIndex] = React.useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false)
  const mainVideoPlayerRef = React.useRef<HTMLVideoElement | null>(null)

  // Handle cinematic playlist selection
  const switchCampaign = (index: number) => {
    setActiveCampaignIndex(index)
    setIsVideoPlaying(false)
    const player = mainVideoPlayerRef.current
    if (player) {
      player.src = CAMPAIGN_REELS[index].videoUrl
      player.load()
      player.pause()
    }
  }

  // Play/pause campaign video
  const togglePlayState = () => {
    const player = mainVideoPlayerRef.current
    if (!player) return

    if (isVideoPlaying) {
      player.pause()
      setIsVideoPlaying(false)
    } else {
      player.play().then(() => {
        setIsVideoPlaying(true)
      }).catch(err => {
        console.warn("Autoplay blocked. Loaded muted.", err)
      })
    }
  }

  return (
    <section id="campaign" className="py-24 md:py-36 px-6 md:px-12 bg-luxury-obsidian relative">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-semibold block">Exclusive Campaigns</span>
          <h2 className="font-serif text-4xl md:text-6xl text-luxury-cream">
            The Cinematic <span className="text-gold-gradient italic">Showcase</span>
          </h2>
          <p className="text-luxury-cream/60 max-w-2xl mx-auto text-sm md:text-base">
            Immerse yourself in our cinematic commercials designed to evoke the essence of true oceanfront luxury living.
          </p>
        </div>

        {/* Player Grid */}
        <div className="bg-luxury-charcoal/40 border border-luxury-gold/30 rounded-3xl overflow-hidden p-4 md:p-8 gold-glow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Major Player */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-luxury-gold/10 group shadow-inner">
                {/* Preview Image */}
                <div className={`absolute inset-0 transition-transform duration-700 brightness-[0.85] ${isVideoPlaying ? "hidden" : "block group-hover:scale-102"}`}>
                  <Image
                    id="mainVideoPreview"
                    src={CAMPAIGN_REELS[activeCampaignIndex].previewUrl}
                    alt="Cinematic Preview"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Gradient shadow overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* HTML5 Video Player */}
                <video
                  id="mainVideoPlayer"
                  ref={mainVideoPlayerRef}
                  className={`absolute inset-0 w-full h-full object-cover ${isVideoPlaying ? "block" : "hidden"}`}
                  loop
                  muted
                  playsInline
                ></video>

                {/* Play Overlay */}
                <button
                  id="playBtnOverlay"
                  onClick={togglePlayState}
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all duration-300 group/btn cursor-pointer ${
                    isVideoPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                  }`}
                >
                  <div className="w-20 h-20 rounded-full bg-gold-gradient text-luxury-obsidian flex items-center justify-center shadow-2xl transform group-hover/btn:scale-110 transition-transform duration-300">
                    <i id="playBtnIcon" className={`fa-solid text-2xl ${isVideoPlaying ? "fa-pause" : "fa-play ml-1"}`}></i>
                  </div>
                </button>

                {/* Badge */}
                <div className="absolute top-4 left-4 bg-luxury-obsidian/95 border border-luxury-gold/40 text-[10px] tracking-[0.2em] uppercase text-luxury-gold px-3.5 py-1.5 rounded-full font-semibold backdrop-blur flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span id="campaignTag">{CAMPAIGN_REELS[activeCampaignIndex].tag}</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                  <span id="campaignTitle" className="font-serif text-lg text-white font-semibold drop-shadow-md">
                    {CAMPAIGN_REELS[activeCampaignIndex].title}
                  </span>
                  <span id="campaignDuration" className="text-xs text-luxury-lightGold font-semibold">
                    {CAMPAIGN_REELS[activeCampaignIndex].duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracks (Right side) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-luxury-gold uppercase tracking-[0.2em] text-[11px] font-bold block mb-1">Select Campaign Reel</span>

                {CAMPAIGN_REELS.map((reel, index) => (
                  <button
                    key={index}
                    onClick={() => switchCampaign(index)}
                    className={`w-full text-left rounded-xl p-4 transition-all duration-300 flex items-center gap-4 group cursor-pointer ${
                      index === activeCampaignIndex
                        ? "bg-luxury-obsidian border border-luxury-gold border-gold-gradient shadow-md"
                        : "bg-luxury-charcoal/20 border border-white/10 hover:border-luxury-gold/40"
                    }`}
                  >
                    <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-luxury-charcoal">
                      <Image src={reel.previewUrl} alt={reel.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <i className="fa-solid fa-circle-play text-white/90 text-sm"></i>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-serif text-sm text-luxury-cream group-hover:text-luxury-gold transition-colors truncate">
                        {reel.title.replace("Campaign Reel ", "")}
                      </h4>
                      <p className="text-[10px] text-luxury-cream/50 uppercase tracking-widest mt-0.5">
                        {index === 0 ? "Beachfront Lounge" : index === 1 ? "Poolside Cabanas" : "Beachfront Dining"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Specs */}
              <div className="p-4 bg-luxury-obsidian rounded-xl border border-luxury-gold/15 space-y-2">
                <span className="text-luxury-gold font-semibold uppercase text-[10px] tracking-widest block">Featured Spec</span>
                <div className="flex items-center gap-2 text-xs text-luxury-cream/80">
                  <i className="fa-solid fa-camera-retro text-luxury-gold"></i>
                  <span>Filmed in 8K Ultra-High Dynamic Range</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-luxury-cream/80">
                  <i className="fa-solid fa-headphones text-luxury-gold"></i>
                  <span>Surround-Sound Spatial Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
