"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/auth/actions"
import { createClient } from "@/lib/supabase/client"

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
  const [isUploadingDesktop, setIsUploadingDesktop] = React.useState(false)
  const [isUploadingMobile, setIsUploadingMobile] = React.useState(false)

  const saveSettingDirectly = async (key: string, value: string) => {
    try {
      const result = await updateSystemSettingsAction({ [key]: value })
      if (result.success) {
        toast.success(`Successfully saved!`)
      } else {
        toast.error(`Auto-save failed: ${result.error}`)
      }
    } catch (err) {
      console.error("[AutoSave] Error:", err)
      toast.error("Auto-save failed.")
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Validate File Size (strictly limit to 50MB for video)
    const MAX_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_SIZE) {
      toast.error("File size exceeds 50MB limit.")
      return
    }

    // 2. Validate format (video types or image types)
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      toast.error("Invalid file format. Please upload a video or image file.")
      return
    }

    if (type === "desktop") {
      setIsUploadingDesktop(true)
    } else {
      setIsUploadingMobile(true)
    }

    const toastId = toast.loading(`Uploading asset to storage...`)

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${type}_video_${Date.now()}.${fileExt}`
      const filePath = `hero/${fileName}`

      // Upload file to Supabase Storage
      const { error } = await supabase.storage
        .from("system-settings")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("system-settings")
        .getPublicUrl(filePath)

      if (type === "desktop") {
        setHeroVideoUrl(publicUrl)
        await saveSettingDirectly("hero_video_url", publicUrl)
        toast.success("Desktop video loop uploaded and updated!", { id: toastId })
      } else {
        setHeroVideoUrlMobile(publicUrl)
        await saveSettingDirectly("hero_video_url_mobile", publicUrl)
        toast.success("Mobile video loop uploaded and updated!", { id: toastId })
      }
    } catch (error) {
      console.error(`[Upload] Failed to upload asset for ${type}:`, error)
      toast.error(error instanceof Error ? error.message : "Failed to upload asset.", { id: toastId })
    } finally {
      if (type === "desktop") {
        setIsUploadingDesktop(false)
      } else {
        setIsUploadingMobile(false)
      }
    }
  }

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
        {/* Editor Form container */}
        <div className="lg:col-span-7 space-y-8 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur shadow-xl">
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
                  onBlur={(e) => saveSettingDirectly("hero_subtitle", e.target.value)}
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
                    onBlur={(e) => saveSettingDirectly("hero_title_line_1", e.target.value)}
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
                    onBlur={(e) => saveSettingDirectly("hero_title_line_2", e.target.value)}
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
                  onBlur={(e) => saveSettingDirectly("hero_description", e.target.value)}
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
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Desktop Video Loop</label>
                <div className="flex items-center gap-4 bg-[#16171b] border border-white/10 rounded-xl p-4">
                  <div className="relative flex-1">
                    {heroVideoUrl ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60 truncate max-w-xs md:max-w-md font-mono">
                          {heroVideoUrl.split("/").pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setHeroVideoUrl("")
                            saveSettingDirectly("hero_video_url", "")
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can"></i> Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-white/40 italic">No video loop uploaded</span>
                    )}
                  </div>
                  <input
                    type="file"
                    id="desktopVideoFile"
                    accept="video/*,image/*"
                    disabled={isUploadingDesktop}
                    onChange={(e) => handleUpload(e, "desktop")}
                    className="hidden"
                  />
                  <label
                    htmlFor="desktopVideoFile"
                    className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
                  >
                    {isUploadingDesktop ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up text-[#D4AF37]"></i> Upload File
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Mobile Video Loop</label>
                <div className="flex items-center gap-4 bg-[#16171b] border border-white/10 rounded-xl p-4">
                  <div className="relative flex-1">
                    {heroVideoUrlMobile ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60 truncate max-w-xs md:max-w-md font-mono">
                          {heroVideoUrlMobile.split("/").pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setHeroVideoUrlMobile("")
                            saveSettingDirectly("hero_video_url_mobile", "")
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can"></i> Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-white/40 italic">No mobile video loop uploaded</span>
                    )}
                  </div>
                  <input
                    type="file"
                    id="mobileVideoFile"
                    accept="video/*,image/*"
                    disabled={isUploadingMobile}
                    onChange={(e) => handleUpload(e, "mobile")}
                    className="hidden"
                  />
                  <label
                    htmlFor="mobileVideoFile"
                    className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
                  >
                    {isUploadingMobile ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up text-[#D4AF37]"></i> Upload File
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>



        </div>

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
              {/* Background Video Loop */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {heroVideoUrl ? (
                  <video
                    key={heroVideoUrl}
                    src={heroVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.5] scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-0">
                    <span className="text-xs text-white/40 italic">No video loop active</span>
                  </div>
                )}
                {/* Simulated dark overlay */}
                <div className="absolute inset-0 bg-black/45 z-10" />
              </div>

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


          </div>
        </div>
      </main>
    </div>
  )
}
