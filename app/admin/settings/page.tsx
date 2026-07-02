"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/auth/actions"

export default function AdminSettingsPage() {
  const router = useRouter()
  
  // Settings states
  const [heroSubtitle, setHeroSubtitle] = React.useState("The Apex of Oceanfront Luxury")
  const [heroTitleLine1, setHeroTitleLine1] = React.useState("Where Sky Meets")
  const [heroTitleLine2, setHeroTitleLine2] = React.useState("Sanctuary")
  const [heroDescription, setHeroDescription] = React.useState("Nestled along the pristine sands of the Aegean coastline, Ocean Hill Resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.")
  
  const [themeColorPrimary, setThemeColorPrimary] = React.useState("#D4AF37")
  const [themeColorSecondary, setThemeColorSecondary] = React.useState("#FFFFFF")
  const [themeColorAccent, setThemeColorAccent] = React.useState("#1C1A17")

  const [heroVideoUrl, setHeroVideoUrl] = React.useState("/videos/enhance_ocean_hill_villas.mp4")
  const [heroVideoUrlMobile, setHeroVideoUrlMobile] = React.useState("/videos/enhance_ocean_hill_villas_mobile.mp4")
  
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)

  // Fetch current settings on mount
  React.useEffect(() => {
    getSystemSettingsAction()
      .then((settings) => {
        setHeroSubtitle(settings.heroSubtitle)
        setHeroTitleLine1(settings.heroTitleLine1)
        setHeroTitleLine2(settings.heroTitleLine2)
        setHeroDescription(settings.heroDescription)
        setThemeColorPrimary(settings.themeColorPrimary)
        setThemeColorSecondary(settings.themeColorSecondary)
        setThemeColorAccent(settings.themeColorAccent)
        setHeroVideoUrl(settings.heroVideoUrl || "/videos/enhance_ocean_hill_villas.mp4")
        setHeroVideoUrlMobile(settings.heroVideoUrlMobile || "/videos/enhance_ocean_hill_villas_mobile.mp4")
      })
      .catch((err) => {
        console.error("[AdminSettings] Error fetching settings:", err)
        toast.error("Failed to load existing system settings.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Handle form save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      hero_subtitle: heroSubtitle,
      hero_title_line_1: heroTitleLine1,
      hero_title_line_2: heroTitleLine2,
      hero_description: heroDescription,
      theme_color_primary: themeColorPrimary,
      theme_color_secondary: themeColorSecondary,
      theme_color_accent: themeColorAccent,
      hero_video_url: heroVideoUrl,
      hero_video_url_mobile: heroVideoUrlMobile,
    }

    try {
      const result = await updateSystemSettingsAction(payload)
      if (result.success) {
        toast.success("System configurations successfully saved!")
      } else {
        toast.error(result.error || "Failed to update configurations.")
      }
    } catch (err) {
      console.error("[AdminSettings] Save error:", err)
      toast.error("An unexpected error occurred while saving.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-[#D4AF37]"></i>
          <span className="text-sm tracking-widest uppercase font-semibold text-white/60">Retrieving Resort Configuration...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#EAE5D9] font-sans pb-16">
      {/* Top Navbar */}
      <header className="border-b border-[#D4AF37]/20 bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-screwdriver-wrench text-[#D4AF37] text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-white">Ocean Hill Admin</h1>
            <p className="text-[10px] text-white/50 tracking-widest uppercase font-bold">System Customization</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-xs font-semibold hover:text-[#D4AF37] transition-colors border border-white/10 hover:border-[#D4AF37]/50 rounded-full px-4 py-2 bg-white/5 cursor-pointer"
        >
          <i className="fa-solid fa-chevron-left"></i> View Live Site
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-8 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur shadow-xl">
          <div>
            <h2 className="font-serif text-2xl text-white tracking-wide border-b border-white/10 pb-3 mb-6">
              Resort Configuration Editor
            </h2>
          </div>

          {/* Section: Hero Copy */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
              <i className="fa-solid fa-align-left"></i> Hero Section Content
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Hero Subtitle</label>
                <input
                  type="text"
                  required
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Title (Line 1)</label>
                  <input
                    type="text"
                    required
                    value={heroTitleLine1}
                    onChange={(e) => setHeroTitleLine1(e.target.value)}
                    className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Title (Line 2 - Italicized)</label>
                  <input
                    type="text"
                    required
                    value={heroTitleLine2}
                    onChange={(e) => setHeroTitleLine2(e.target.value)}
                    className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Hero Description</label>
                <textarea
                  required
                  rows={4}
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Video / Clips */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
              <i className="fa-solid fa-video"></i> Hero Background Videos
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Desktop Video URL</label>
                <input
                  type="text"
                  required
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Mobile Video URL</label>
                <input
                  type="text"
                  required
                  value={heroVideoUrlMobile}
                  onChange={(e) => setHeroVideoUrlMobile(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Palette */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
              <i className="fa-solid fa-palette"></i> Brand Theme Colors
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">Primary (Gold)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeColorPrimary}
                    onChange={(e) => setThemeColorPrimary(e.target.value)}
                    className="w-12 h-10 bg-[#16171b] border border-white/10 rounded-lg cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    required
                    value={themeColorPrimary}
                    onChange={(e) => setThemeColorPrimary(e.target.value)}
                    className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-lg px-2 text-xs focus:outline-none text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">Secondary (Light)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeColorSecondary}
                    onChange={(e) => setThemeColorSecondary(e.target.value)}
                    className="w-12 h-10 bg-[#16171b] border border-white/10 rounded-lg cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    required
                    value={themeColorSecondary}
                    onChange={(e) => setThemeColorSecondary(e.target.value)}
                    className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-lg px-2 text-xs focus:outline-none text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide">Accent (Dark)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeColorAccent}
                    onChange={(e) => setThemeColorAccent(e.target.value)}
                    className="w-12 h-10 bg-[#16171b] border border-white/10 rounded-lg cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    required
                    value={themeColorAccent}
                    onChange={(e) => setThemeColorAccent(e.target.value)}
                    className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-lg px-2 text-xs focus:outline-none text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#AA7C11] text-[#1c1a17] font-bold py-3.5 px-8 rounded-full shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving Settings...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Publish System Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-28 bg-[#16171b] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass"></i> Live Preview Panel
              </h3>
              <p className="text-[11px] text-white/40 mt-1">Real-time approximation of the main website hero block.</p>
            </div>

            {/* Simulated Hero Section */}
            <div className="relative border border-white/5 rounded-2xl aspect-video w-full overflow-hidden bg-[#0b0c10] flex items-center justify-center p-6 text-center select-none shadow-inner">
              {/* Simulated dark overlay */}
              <div className="absolute inset-0 bg-black/55 z-0" />

              <div className="relative z-10 space-y-3 w-full">
                {/* Subtitle */}
                <span
                  style={{ color: themeColorPrimary }}
                  className="block font-semibold tracking-[0.2em] uppercase text-[9px] transition-colors duration-300"
                >
                  ★ {heroSubtitle} ★
                </span>

                {/* Main Header */}
                <h1
                  style={{ color: themeColorSecondary }}
                  className="font-serif text-xl sm:text-2xl leading-tight transition-colors duration-300"
                >
                  {heroTitleLine1} <br />
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${themeColorPrimary}e6 0%, ${themeColorPrimary} 50%, ${themeColorPrimary}b3 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    className="italic font-normal transition-colors duration-300"
                  >
                    {heroTitleLine2}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-white/70 max-w-sm mx-auto text-[10px] tracking-wide font-light leading-relaxed truncate-3-lines">
                  {heroDescription}
                </p>

                {/* Dummy Button */}
                <div className="pt-2 flex justify-center">
                  <div
                    style={{ backgroundColor: themeColorPrimary, color: themeColorAccent }}
                    className="text-[9px] font-bold px-4 py-1.5 rounded-full shadow transition-all duration-300 cursor-default"
                  >
                    Reserve Stay
                  </div>
                </div>
              </div>
            </div>

            {/* Custom CSS Variable Inspector */}
            <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider text-white/50 font-semibold font-mono">Injected Design Tokens</h4>
              <div className="font-mono text-[10px] space-y-1 text-white/75">
                <div><span className="text-[#D4AF37]">--color-luxury-gold:</span> {themeColorPrimary}</div>
                <div><span className="text-white/60">--color-luxury-obsidian:</span> {themeColorSecondary}</div>
                <div><span className="text-[#AA7C11]">--color-luxury-cream:</span> {themeColorAccent}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
