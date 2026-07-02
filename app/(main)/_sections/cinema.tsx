"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"

const CAMPAIGN_REELS = [
  {
    title: "Coastal Sunrise",
    scene: "Beachfront",
    duration: "14 sec Loop",
    previewUrl: "/images/image3.png",
    videoUrl: "/videos/enhance_ocean_hill_villas.mp4",
    description: "A breathtaking aerial sweep across our private beachfront at golden hour. Witness the seamless blend of oceanfront architecture, shimmering lagoon pools, and the untouched Aegean horizon as day melts into evening."
  },
  {
    title: "Lagoon Splendor",
    scene: "Poolside",
    duration: "18 sec Loop",
    previewUrl: "/images/image6.png",
    videoUrl: "/videos/enhance_ocean_hill_villas_original.mp4",
    description: "Step inside the world of absolute luxury as our resort's signature overwater villas and private lagoon pools come to life. Explore the lush tropical environments and exclusive beach club lounges curated for a select few."
  },
  {
    title: "Seaside Sunset",
    scene: "Sunset Dining",
    duration: "11 sec Loop",
    previewUrl: "/images/image5.png",
    videoUrl: "/videos/enhance_ocean_hill_villas_mobile.mp4",
    description: "The golden hour reel. As champagne is poured on your private balcony terrace, the ocean turns to glass. This is the essence of Ocean Hill — where every sunset is your personal cinematic experience."
  },
  {
    title: "Ocean Drift",
    scene: "Yacht Harbor",
    duration: "15 sec Loop",
    previewUrl: "/images/image4.png",
    videoUrl: "/videos/enhance_ocean_hill_villas.webm",
    description: "A fluid drift through our private yacht harbor and overwater bungalows at blue hour. The stillness of the sea mirrors the absolute serenity of a stay at Ocean Hill Villas."
  },
  {
    title: "Sky & Shore",
    scene: "Aerial Vista",
    duration: "10 sec Loop",
    previewUrl: "/images/image7.webp",
    videoUrl: "/videos/enhance_ocean_hill_villas_mobile.webm",
    description: "A bird's-eye cinematic sweep over our pristine peninsula coastline and cliffside infinity pools. Shot exclusively during the resort's private golden hour window."
  }
]

export default function Cinema() {
  const [activeCampaignIndex, setActiveCampaignIndex] = React.useState(0)
  const mainVideoPlayerRef = React.useRef<HTMLVideoElement | null>(null)

  // Handle playlist selection
  const switchCampaign = (index: number) => {
    setActiveCampaignIndex(index)
  }

  // Auto-advance playlist when video ends (loops continuously)
  const handleVideoEnded = () => {
    setActiveCampaignIndex((prev) => (prev + 1) % CAMPAIGN_REELS.length)
  }

  // Safe autoplay: useEffect only needed to handle auto-advance after onEnded
  // The key={activeCampaignIndex} on the <video> handles src switching on click

  return (
    <section id="campaign" className="pt-12 md:pt-16 pb-12 md:pb-16 px-6 md:px-12 bg-luxury-obsidian relative">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Major Player (Left side) */}
          <div className="lg:col-span-8 flex flex-col h-full lg:order-1">
            <div className="relative h-full min-h-[300px] md:min-h-[420px] w-full rounded-3xl overflow-hidden bg-black border-2 border-luxury-gold shadow-2xl gold-glow">
              {/* HTML5 Video Player */}
              <video
                key={activeCampaignIndex}
                ref={mainVideoPlayerRef}
                src={CAMPAIGN_REELS[activeCampaignIndex].videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
              ></video>

              {/* Overlay: gradient + text inside the video */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-white/50 uppercase tracking-widest">
                    {CAMPAIGN_REELS[activeCampaignIndex].duration}
                  </span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-luxury-gold drop-shadow-lg">
                  {CAMPAIGN_REELS[activeCampaignIndex].title}
                </h3>
                <p className="text-white/70 text-xs md:text-sm leading-relaxed font-light max-w-xl">
                  {CAMPAIGN_REELS[activeCampaignIndex].description}
                </p>
              </div>
            </div>
          </div>

          {/* Tracks Card Wrapper (Right side) */}
          <div className="lg:col-span-4 flex flex-col justify-between p-6 bg-luxury-charcoal/40 border border-luxury-gold/30 rounded-3xl shadow-2xl gold-glow lg:order-2">
            <div className="space-y-4">
              <span className="text-luxury-gold uppercase tracking-[0.2em] text-[11px] font-bold block mb-1">Select Campaign Reel</span>

              <div className="space-y-3">
                {CAMPAIGN_REELS.map((reel, index) => (
                  <button
                    key={index}
                    onClick={() => switchCampaign(index)}
                    className={`w-full text-left rounded-xl p-4 transition-all duration-300 flex items-center gap-4 cursor-pointer shadow-md ${
                      index === activeCampaignIndex
                        ? "bg-luxury-obsidian border border-luxury-gold shadow-lg gold-glow scale-[1.01]"
                        : "bg-luxury-charcoal/20 border border-luxury-gold/15"
                    }`}
                  >
                    <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-luxury-charcoal">
                      <Image src={reel.previewUrl} alt={reel.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <i className="fa-solid fa-circle-play text-white/90 text-sm"></i>
                      </div>
                    </div>
                    <div className="overflow-hidden flex-1 space-y-1">
                      <h4 className="font-serif text-sm text-luxury-cream transition-colors truncate">
                        {reel.title}
                      </h4>
                      <div className="flex justify-between items-center text-[10px] text-luxury-cream/50 uppercase tracking-widest">
                        <span>{reel.scene}</span>
                        <span className="text-luxury-gold/60">{reel.duration}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* No specs card */}
          </div>
        </div>

        {/* Explore CTA */}
        <div className="flex justify-center pt-4">
          <Link
            href="/villas"
            className="inline-flex w-full sm:w-auto min-w-[240px] bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-bold text-xs uppercase tracking-[0.2em] py-4 px-8 rounded-full shadow-lg active:scale-98 transition-all items-center justify-center gap-2 border-none text-center"
          >
            Explore Our Villas <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </div>
    </section>
  )
}
