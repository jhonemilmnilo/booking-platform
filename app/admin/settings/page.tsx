"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/auth/actions"
import { createClient } from "@/lib/supabase/client"
import { getClientCachedSettings, setClientCachedSettings } from "@/lib/client-cache"
import { AdminSidebarToggle } from "@/app/admin/_components/admin-shell"
import AdminUserDropdown from "@/app/admin/_components/admin-user-dropdown"

// Declared at module level to satisfy react-hooks/static-components
interface SaveBtnProps { large?: boolean; isSaving: boolean; hasChanges: boolean; onClick: () => void }
function SaveBtn({ large = false, isSaving, hasChanges, onClick }: SaveBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSaving || !hasChanges}
      className={`flex items-center gap-2 bg-luxury-gold hover:bg-luxury-gold/90 disabled:opacity-40 disabled:cursor-not-allowed text-luxury-obsidian font-bold uppercase tracking-widest rounded-xl transition-all duration-200 shadow-lg cursor-pointer ${large ? "text-xs px-6 py-3" : "text-xs px-4 py-2"}`}
    >
      {isSaving
        ? <><i className="fa-solid fa-spinner fa-spin text-sm"></i> Saving…</>
        : <><i className="fa-solid fa-floppy-disk text-sm"></i> {large ? "Save All Changes" : "Save Changes"}</>}
    </button>
  )
}

// Skeleton bone — defined at module level to satisfy react-hooks/static-components
function SkeletonBone({ className = "" }: { className?: string }) {
  return <div className={`bg-black/[0.08] dark:bg-white/[0.06] rounded-xl animate-pulse ${className}`} />
}

export default function AdminSettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter()

  // ─── Settings state ────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_brandName, setBrandName] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.brandName) return c.brandName
    }
    return "MIGS THE SHORE"
  })
  const [heroSubtitle, setHeroSubtitle] = React.useState("The Apex of Oceanfront Luxury")
  const [heroTitleLine1, setHeroTitleLine1] = React.useState("Where Sky Meets")
  const [heroTitleLine2, setHeroTitleLine2] = React.useState("Sanctuary")
  const [heroDescription, setHeroDescription] = React.useState(
    "Nestled along the pristine sands of the coastline, our luxury resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation."
  )

  const [themeColorPrimary, setThemeColorPrimary] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.themeColorPrimary) return c.themeColorPrimary
    }
    return "#D4AF37"
  })
  const [themeColorSecondary, setThemeColorSecondary] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.themeColorSecondary) return c.themeColorSecondary
    }
    return "#FFFFFF"
  })
  const [themeColorAccent, setThemeColorAccent] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.themeColorAccent) return c.themeColorAccent
    }
    return "#1C1A17"
  })

  const [heroVideoUrl, setHeroVideoUrl] = React.useState("/videos/enhance_ocean_hill_villas.mp4")
  const [heroVideoUrlMobile, setHeroVideoUrlMobile] = React.useState("/videos/enhance_ocean_hill_villas_mobile.mp4")

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [isUploadingDesktop, setIsUploadingDesktop] = React.useState(false)
  const [isUploadingMobile, setIsUploadingMobile] = React.useState(false)

  // ─── Dirty-tracking setters ────────────────────────────────────────────────
  function mkDirty<T>(setter: React.Dispatch<React.SetStateAction<T>>) {
    return (v: T) => { setter(v); setHasChanges(true) }
  }
  const setHeroSubtitleD             = mkDirty(setHeroSubtitle)
  const setHeroTitleLine1D           = mkDirty(setHeroTitleLine1)
  const setHeroTitleLine2D           = mkDirty(setHeroTitleLine2)
  const setHeroDescriptionD          = mkDirty(setHeroDescription)

  // ─── Save ALL changes (one request) ───────────────────────────────────────
  const saveAllChanges = async () => {
    setIsSaving(true)
    try {
      const result = await updateSystemSettingsAction({
        hero_subtitle:                heroSubtitle,
        hero_title_line_1:            heroTitleLine1,
        hero_title_line_2:            heroTitleLine2,
        hero_description:             heroDescription,
      })
      if (result.success) {
        setHasChanges(false)
        toast.success("Hero settings saved successfully!")
      } else {
        toast.error(`Save failed: ${result.error}`)
      }
    } catch (err) {
      console.error("[SaveAll] Error:", err)
      toast.error("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Video remove/upload saves immediately (destructive; bypass batch)
  const saveSettingDirectly = async (key: string, value: string) => {
    try {
      const result = await updateSystemSettingsAction({ [key]: value })
      if (!result.success) toast.error(`Save failed: ${result.error}`)
    } catch (err) {
      console.error("[DirectSave] Error:", err)
      toast.error("Save failed.")
    }
  }

  // ─── Upload handler ────────────────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { toast.error("File size exceeds 50MB limit."); return }
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      toast.error("Invalid file format. Please upload a video or image file."); return
    }
    if (type === "desktop") setIsUploadingDesktop(true); else setIsUploadingMobile(true)
    const toastId = toast.loading("Uploading asset to storage...")
    try {
      const supabase = createClient()
      const fileExt  = file.name.split(".").pop()
      const filePath = `hero/${type}_video_${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from("system-settings").upload(filePath, file, { cacheControl: "3600", upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from("system-settings").getPublicUrl(filePath)
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
      if (type === "desktop") setIsUploadingDesktop(false); else setIsUploadingMobile(false)
    }
  }

  // ─── Hydrate from DB on mount ──────────────────────────────────────────────
  React.useEffect(() => {
    getSystemSettingsAction()
      .then((settings) => {
        if (settings.brandName) setBrandName(settings.brandName)
        setHeroSubtitle(settings.heroSubtitle)
        setHeroTitleLine1(settings.heroTitleLine1)
        setHeroTitleLine2(settings.heroTitleLine2)
        setHeroDescription(settings.heroDescription)
        setThemeColorPrimary(settings.themeColorPrimary)
        setThemeColorSecondary(settings.themeColorSecondary)
        setThemeColorAccent(settings.themeColorAccent)
        setHeroVideoUrl(settings.heroVideoUrl || "/videos/enhance_ocean_hill_villas.mp4")
        setHeroVideoUrlMobile(settings.heroVideoUrlMobile || "/videos/enhance_ocean_hill_villas_mobile.mp4")
        setHasChanges(false)

        if (typeof window !== "undefined") {
          setClientCachedSettings({
            ...(getClientCachedSettings() || {}),
            brandName: settings.brandName,
            themeColorPrimary: settings.themeColorPrimary,
            themeColorSecondary: settings.themeColorSecondary,
            themeColorAccent: settings.themeColorAccent,
            heroSubtitle: settings.heroSubtitle,
            heroTitleLine1: settings.heroTitleLine1,
            heroTitleLine2: settings.heroTitleLine2,
            heroDescription: settings.heroDescription,
            heroVideoUrl: settings.heroVideoUrl,
            heroVideoUrlMobile: settings.heroVideoUrlMobile,
            resortLatitude: settings.resortLatitude,
            resortLongitude: settings.resortLongitude,
            resortRegion: settings.resortRegion,
            resortLocationTitleLine1: settings.resortLocationTitleLine1,
            resortLocationTitleLine2: settings.resortLocationTitleLine2,
            resortLocationDescription: settings.resortLocationDescription,
          })
        }
      })
      .catch((err) => {
        console.error("[AdminSettings] Error fetching settings:", err)
        toast.error("Failed to load existing system settings.")
      })
      .finally(() => setIsLoading(false))
  }, [])

  // ─── Skeleton loading ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
        {/* Skeleton header */}
        <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AdminSidebarToggle />
            <SkeletonBone className="w-7 h-7 rounded-lg" />
            <div className="space-y-1.5">
              <SkeletonBone className="w-40 h-4 rounded-lg" />
              <SkeletonBone className="w-24 h-2.5 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <SkeletonBone className="w-28 h-8 rounded-xl" />
            <SkeletonBone className="w-32 h-8 rounded-xl" />
          </div>
        </header>

        <main className="w-full px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form skeleton */}
          <div className="lg:col-span-7 space-y-8 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl">
            {/* Title */}
            <SkeletonBone className="w-56 h-7 rounded-xl" />

            {/* Section: Hero Copy */}
            <div className="space-y-5">
              <SkeletonBone className="w-36 h-3 rounded-lg" />
              <SkeletonBone className="w-full h-11 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <SkeletonBone className="h-11 rounded-xl" />
                <SkeletonBone className="h-11 rounded-xl" />
              </div>
              <SkeletonBone className="w-full h-24 rounded-xl" />
              <SkeletonBone className="w-full h-28 rounded-xl" />
            </div>

            {/* Section: Location */}
            <div className="space-y-5 pt-2">
              <SkeletonBone className="w-44 h-3 rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <SkeletonBone className="h-11 rounded-xl" />
                <SkeletonBone className="h-11 rounded-xl" />
              </div>
              <SkeletonBone className="w-full h-[180px] rounded-xl" />
              <SkeletonBone className="w-full h-11 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <SkeletonBone className="h-11 rounded-xl" />
                <SkeletonBone className="h-11 rounded-xl" />
              </div>
              <SkeletonBone className="w-full h-20 rounded-xl" />
            </div>

            {/* Section: Videos */}
            <div className="space-y-5 pt-2">
              <SkeletonBone className="w-40 h-3 rounded-lg" />
              <SkeletonBone className="w-full h-16 rounded-xl" />
              <SkeletonBone className="w-full h-16 rounded-xl" />
            </div>

            {/* Bottom bar */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <SkeletonBone className="w-40 h-3 rounded-lg" />
              <SkeletonBone className="w-36 h-10 rounded-xl" />
            </div>
          </div>

          {/* Preview skeleton */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white dark:bg-[#16171b] border border-black/10 dark:border-white/10 rounded-3xl p-6 space-y-5 shadow-sm dark:shadow-xl">
              <div className="space-y-2">
                <SkeletonBone className="w-36 h-3 rounded-lg" />
                <SkeletonBone className="w-52 h-2.5 rounded-lg" />
              </div>
              <SkeletonBone className="w-full aspect-video rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    )
  }


  // ─── Page ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">

      {/* ── Sticky Top Navbar ── */}
      <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarToggle />
          <i className="fa-solid fa-sliders text-luxury-gold text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-[#1C1A17] dark:text-white">Hero Editor</h1>
            <p className="text-[10px] text-[#7A746B] dark:text-white/40 uppercase tracking-widest font-semibold">Resort Hero & Media Customization</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {hasChanges && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest animate-pulse mr-1">
              <i className="fa-solid fa-circle-dot text-[8px]"></i> Unsaved changes
            </span>
          )}
          <SaveBtn large={false} isSaving={isSaving} hasChanges={hasChanges} onClick={saveAllChanges} />
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

      <main className="w-full px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Editor Form ── */}
        <div className="lg:col-span-7 space-y-8 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur shadow-sm dark:shadow-xl">
          <div>
            <h2 className="font-serif text-2xl text-[#1C1A17] dark:text-white tracking-wide border-b border-black/10 dark:border-white/10 pb-3 mb-6">
              Resort Configuration Editor
            </h2>
          </div>

          {/* ── Hero Copy ── */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-luxury-gold uppercase flex items-center gap-2">
              <i className="fa-solid fa-align-left"></i> Hero Section Content
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">Hero Subtitle</label>
                <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitleD(e.target.value)}
                  className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">Title (Line 1)</label>
                  <input type="text" value={heroTitleLine1} onChange={(e) => setHeroTitleLine1D(e.target.value)}
                    className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">Title (Line 2 — Italicized)</label>
                  <input type="text" value={heroTitleLine2} onChange={(e) => setHeroTitleLine2D(e.target.value)}
                    className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">Hero Description</label>
                <textarea rows={4} value={heroDescription} onChange={(e) => setHeroDescriptionD(e.target.value)}
                  className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white resize-none" />
              </div>
            </div>

            {/* Quick Link to Dedicated Location & Attractions Module */}
            <div className="bg-gradient-to-r from-luxury-gold/10 via-black/[0.02] dark:via-white/[0.02] to-transparent border border-luxury-gold/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-luxury-gold/20 text-luxury-gold flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-map-location-dot text-sm"></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1C1A17] dark:text-white">Resort Location & Attractions</p>
                  <p className="text-[11px] text-[#7A746B] dark:text-white/50">Coordinates, interactive Google Map, and tourist spots are now in their own module.</p>
                </div>
              </div>
              <Link
                href="/admin/location"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-luxury-gold text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all shrink-0"
              >
                <span>Open Module</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* ── Hero Background Videos ── */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-bold tracking-widest text-luxury-gold uppercase flex items-center gap-2">
              <i className="fa-solid fa-video"></i> Hero Background Videos
            </h3>
            <div className="space-y-4">
              {/* Desktop */}
              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">Desktop Video Loop</label>
                <div className="flex items-center gap-4 bg-[#F8F6F0] dark:bg-[#16171b] border border-black/10 dark:border-white/10 rounded-xl p-4">
                  <div className="relative flex-1">
                    {heroVideoUrl ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#5C564F] dark:text-white/60 truncate max-w-xs md:max-w-md font-mono">{heroVideoUrl.split("/").pop()}</span>
                        <button type="button" onClick={() => { setHeroVideoUrl(""); saveSettingDirectly("hero_video_url", "") }}
                          className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                          <i className="fa-solid fa-trash-can"></i> Remove
                        </button>
                      </div>
                    ) : <span className="text-xs text-[#7A746B] dark:text-white/40 italic">No video loop uploaded</span>}
                  </div>
                  <input type="file" id="desktopVideoFile" accept="video/*,image/*" disabled={isUploadingDesktop} onChange={(e) => handleUpload(e, "desktop")} className="hidden" />
                  <label htmlFor="desktopVideoFile" className="bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-luxury-gold/50 hover:bg-luxury-gold/10 text-[#1C1A17] dark:text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300">
                    {isUploadingDesktop ? <><i className="fa-solid fa-spinner fa-spin"></i> Uploading...</> : <><i className="fa-solid fa-cloud-arrow-up text-luxury-gold"></i> Upload File</>}
                  </label>
                </div>
              </div>
              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">Mobile Video Loop</label>
                <div className="flex items-center gap-4 bg-[#F8F6F0] dark:bg-[#16171b] border border-black/10 dark:border-white/10 rounded-xl p-4">
                  <div className="relative flex-1">
                    {heroVideoUrlMobile ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#5C564F] dark:text-white/60 truncate max-w-xs md:max-w-md font-mono">{heroVideoUrlMobile.split("/").pop()}</span>
                        <button type="button" onClick={() => { setHeroVideoUrlMobile(""); saveSettingDirectly("hero_video_url_mobile", "") }}
                          className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                          <i className="fa-solid fa-trash-can"></i> Remove
                        </button>
                      </div>
                    ) : <span className="text-xs text-[#7A746B] dark:text-white/40 italic">No mobile video loop uploaded</span>}
                  </div>
                  <input type="file" id="mobileVideoFile" accept="video/*,image/*" disabled={isUploadingMobile} onChange={(e) => handleUpload(e, "mobile")} className="hidden" />
                  <label htmlFor="mobileVideoFile" className="bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-luxury-gold/50 hover:bg-luxury-gold/10 text-[#1C1A17] dark:text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300">
                    {isUploadingMobile ? <><i className="fa-solid fa-spinner fa-spin"></i> Uploading...</> : <><i className="fa-solid fa-cloud-arrow-up text-luxury-gold"></i> Upload File</>}
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Live Preview Panel ── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-28 bg-white dark:bg-[#16171b] border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-luxury-gold uppercase flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass"></i> Live Preview Panel
              </h3>
              <p className="text-[11px] text-[#7A746B] dark:text-white/40 mt-1">Real-time approximation of the main website hero block.</p>
            </div>

            <div className="relative border border-black/10 dark:border-white/5 rounded-2xl aspect-video w-full overflow-hidden bg-[#0b0c10] flex items-center justify-center p-6 text-center select-none shadow-inner">
              <div className="absolute inset-0 z-0 overflow-hidden">
                {heroVideoUrl ? (
                  <video key={heroVideoUrl} src={heroVideoUrl} autoPlay loop muted playsInline preload="auto"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.5] scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-0">
                    <span className="text-xs text-white/40 italic">No video loop active</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/45 z-10" />
              </div>
              <div className="relative z-10 space-y-3 w-full">
                <span style={{ color: themeColorPrimary }} className="block font-semibold tracking-[0.2em] uppercase text-[9px] transition-colors duration-300">
                  ★ {heroSubtitle} ★
                </span>
                <h1 style={{ color: themeColorSecondary }} className="font-serif text-xl sm:text-2xl leading-tight transition-colors duration-300">
                  {heroTitleLine1} <br />
                  <span style={{ background: `linear-gradient(135deg, ${themeColorPrimary}e6 0%, ${themeColorPrimary} 50%, ${themeColorPrimary}b3 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                    className="italic font-normal transition-colors duration-300">
                  {heroTitleLine2}
                  </span>
                </h1>
                <p className="text-white/70 max-w-sm mx-auto text-[10px] tracking-wide font-light leading-relaxed">{heroDescription}</p>
                <div className="pt-2 flex justify-center">
                  <div style={{ backgroundColor: themeColorPrimary, color: themeColorAccent }}
                    className="text-[9px] font-bold px-4 py-1.5 rounded-full shadow transition-all duration-300 cursor-default">
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

