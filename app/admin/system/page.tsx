"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { getSystemSettingsAction, updateSystemSettingsAction, uploadBrandLogoAction } from "@/app/auth/actions"
import { getClientCachedSettings, setClientCachedSettings } from "@/lib/client-cache"
import { AdminSidebarToggle } from "@/app/admin/_components/admin-shell"
import AdminUserDropdown from "@/app/admin/_components/admin-user-dropdown"

interface SystemSettingsValues {
  brandName: string
  brandLogo: string
  themeColorPrimary: string
  themeColorSecondary: string
  themeColorAccent: string
  socialFacebook: string
  socialInstagram: string
  socialTiktok: string
  socialTwitter: string
}

export default function GeneralSystemSettingsPage() {

  // General settings states - initialize from cache immediately so there's never a flash of gold/yellow
  const [brandName, setBrandName] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.brandName) return c.brandName
    }
    return "MIGS THE SHORE"
  })
  const [brandLogo, setBrandLogo] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.brandLogo) return c.brandLogo
    }
    return ""
  })

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

  const [socialFacebook, setSocialFacebook] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.socialFacebook) return c.socialFacebook
    }
    return "https://facebook.com"
  })
  const [socialInstagram, setSocialInstagram] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.socialInstagram) return c.socialInstagram
    }
    return "https://instagram.com"
  })
  const [socialTiktok, setSocialTiktok] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.socialTiktok) return c.socialTiktok
    }
    return "https://tiktok.com"
  })
  const [socialTwitter, setSocialTwitter] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.socialTwitter) return c.socialTwitter
    }
    return "https://twitter.com"
  })

  // Baseline of currently persisted settings
  const [savedSettings, setSavedSettings] = React.useState<SystemSettingsValues | null>(null)

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)

  // Live real-time CSS variable updates while editing in the dashboard
  React.useEffect(() => {
    if (typeof document !== "undefined" && themeColorPrimary) {
      const root = document.documentElement
      root.style.setProperty("--theme-color-primary", themeColorPrimary)
      root.style.setProperty("--theme-color-primary-light", `color-mix(in srgb, ${themeColorPrimary} 55%, white)`)
      root.style.setProperty("--theme-color-primary-dark", `color-mix(in srgb, ${themeColorPrimary} 70%, black)`)
      root.style.setProperty("--color-luxury-gold", themeColorPrimary)
      root.style.setProperty("--color-luxury-lightGold", `color-mix(in srgb, ${themeColorPrimary} 55%, white)`)
      root.style.setProperty("--color-luxury-darkGold", `color-mix(in srgb, ${themeColorPrimary} 70%, black)`)
      root.style.setProperty("--primary", themeColorPrimary)
      root.style.setProperty("--theme-color-secondary", themeColorSecondary)
      root.style.setProperty("--color-luxury-obsidian", themeColorSecondary)
      root.style.setProperty("--theme-color-accent", themeColorAccent)
      root.style.setProperty("--color-luxury-cream", themeColorAccent)
    }
  }, [themeColorPrimary, themeColorSecondary, themeColorAccent])

  // Fetch current settings on mount
  React.useEffect(() => {
    getSystemSettingsAction()
      .then((settings) => {
        const loadedValues: SystemSettingsValues = {
          brandName: settings.brandName || "MIGS THE SHORE",
          brandLogo: settings.brandLogo || "",
          themeColorPrimary: settings.themeColorPrimary || "#D4AF37",
          themeColorSecondary: settings.themeColorSecondary || "#FFFFFF",
          themeColorAccent: settings.themeColorAccent || "#1C1A17",
          socialFacebook: settings.socialFacebook || "https://facebook.com",
          socialInstagram: settings.socialInstagram || "https://instagram.com",
          socialTiktok: settings.socialTiktok || "https://tiktok.com",
          socialTwitter: settings.socialTwitter || "https://twitter.com",
        }

        setBrandName(loadedValues.brandName)
        setBrandLogo(loadedValues.brandLogo)
        setThemeColorPrimary(loadedValues.themeColorPrimary)
        setThemeColorSecondary(loadedValues.themeColorSecondary)
        setThemeColorAccent(loadedValues.themeColorAccent)
        setSocialFacebook(loadedValues.socialFacebook)
        setSocialInstagram(loadedValues.socialInstagram)
        setSocialTiktok(loadedValues.socialTiktok)
        setSocialTwitter(loadedValues.socialTwitter)

        setSavedSettings(loadedValues)

        // Always update client cache with latest settings from server
        if (typeof window !== "undefined") {
          setClientCachedSettings({
            ...(getClientCachedSettings() || {}),
            ...loadedValues,
          })
        }
      })
      .catch((err) => {
        console.error("[GeneralSettings] Error fetching settings:", err)
        toast.error("Failed to load existing brand configurations.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Track if there are any pending unsaved changes
  const hasChanges = React.useMemo(() => {
    if (!savedSettings) return false
    return (
      brandName !== savedSettings.brandName ||
      brandLogo !== savedSettings.brandLogo ||
      themeColorPrimary !== savedSettings.themeColorPrimary ||
      themeColorSecondary !== savedSettings.themeColorSecondary ||
      themeColorAccent !== savedSettings.themeColorAccent ||
      socialFacebook !== savedSettings.socialFacebook ||
      socialInstagram !== savedSettings.socialInstagram ||
      socialTiktok !== savedSettings.socialTiktok ||
      socialTwitter !== savedSettings.socialTwitter
    )
  }, [
    savedSettings,
    brandName,
    brandLogo,
    themeColorPrimary,
    themeColorSecondary,
    themeColorAccent,
    socialFacebook,
    socialInstagram,
    socialTiktok,
    socialTwitter,
  ])

  // Prevent accidental navigation with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasChanges])

  // Manual save for all changes
  const handleSaveAll = async () => {
    if (isSaving) return
    setIsSaving(true)
    const toastId = toast.loading("Saving system settings...")

    try {
      const payload: Record<string, string> = {
        brand_name: brandName,
        brand_logo: brandLogo,
        theme_color_primary: themeColorPrimary,
        theme_color_secondary: themeColorSecondary,
        theme_color_accent: themeColorAccent,
        social_facebook: socialFacebook,
        social_instagram: socialInstagram,
        social_tiktok: socialTiktok,
        social_twitter: socialTwitter,
      }

      const result = await updateSystemSettingsAction(payload)
      if (!result.success) {
        throw new Error(result.error || "Failed to update system settings.")
      }

      // Sync local cache for immediate reactivity across the app
      const currentCache = getClientCachedSettings() || {}
      setClientCachedSettings({
        ...currentCache,
        brandName,
        brandLogo,
        themeColorPrimary,
        themeColorSecondary,
        themeColorAccent,
        socialFacebook,
        socialInstagram,
        socialTiktok,
        socialTwitter,
      })

      // Update baseline
      setSavedSettings({
        brandName,
        brandLogo,
        themeColorPrimary,
        themeColorSecondary,
        themeColorAccent,
        socialFacebook,
        socialInstagram,
        socialTiktok,
        socialTwitter,
      })

      // Notify other components like the sidebar and headers in the same tab
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("theme_settings_updated"))
      }

      toast.success("System settings saved successfully!", { id: toastId })
    } catch (err) {
      console.error("[GeneralSettings] Save error:", err)
      toast.error(err instanceof Error ? err.message : "Failed to save settings.", { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  // Revert all edits back to the last saved state
  const handleDiscardChanges = () => {
    if (!savedSettings) return
    setBrandName(savedSettings.brandName)
    setBrandLogo(savedSettings.brandLogo)
    setThemeColorPrimary(savedSettings.themeColorPrimary)
    setThemeColorSecondary(savedSettings.themeColorSecondary)
    setThemeColorAccent(savedSettings.themeColorAccent)
    setSocialFacebook(savedSettings.socialFacebook)
    setSocialInstagram(savedSettings.socialInstagram)
    setSocialTiktok(savedSettings.socialTiktok)
    setSocialTwitter(savedSettings.socialTwitter)

    if (typeof document !== "undefined") {
      const root = document.documentElement
      const primary = savedSettings.themeColorPrimary
      root.style.setProperty("--theme-color-primary", primary)
      root.style.setProperty("--theme-color-primary-light", `color-mix(in srgb, ${primary} 55%, white)`)
      root.style.setProperty("--theme-color-primary-dark", `color-mix(in srgb, ${primary} 70%, black)`)
      root.style.setProperty("--color-luxury-gold", primary)
      root.style.setProperty("--color-luxury-lightGold", `color-mix(in srgb, ${primary} 55%, white)`)
      root.style.setProperty("--color-luxury-darkGold", `color-mix(in srgb, ${primary} 70%, black)`)
      root.style.setProperty("--primary", primary)
      root.style.setProperty("--theme-color-secondary", savedSettings.themeColorSecondary)
      root.style.setProperty("--color-luxury-obsidian", savedSettings.themeColorSecondary)
      root.style.setProperty("--theme-color-accent", savedSettings.themeColorAccent)
      root.style.setProperty("--color-luxury-cream", savedSettings.themeColorAccent)
    }

    toast.info("Unsaved changes discarded.")
  }

  // Handle Logo Upload (strict 5MB limit for images)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (strictly limit to 5MB for images)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      toast.error("Logo image size exceeds the 5MB limit.")
      return
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid format. Please upload an image file (PNG, SVG, JPG, WEBP).")
      return
    }

    setIsUploadingLogo(true)
    const toastId = toast.loading("Uploading brand logo...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadBrandLogoAction(formData)
      if (!result.success || !result.publicUrl) {
        throw new Error(result.error || "Failed to upload logo.")
      }

      setBrandLogo(result.publicUrl)
      toast.success("Logo uploaded! Click 'Save Changes' to apply.", { id: toastId })
    } catch (err) {
      console.error("[GeneralSettings] Logo upload error:", err)
      toast.error(err instanceof Error ? err.message : "Failed to upload logo image.", { id: toastId })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
        {/* Header Skeleton */}
        <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AdminSidebarToggle />
            <div className="w-6 h-6 rounded bg-black/[0.08] dark:bg-white/10 animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-44 h-4 bg-black/[0.08] dark:bg-white/10 rounded animate-pulse" />
              <div className="w-56 h-2.5 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-28 h-8 rounded-xl bg-black/[0.08] dark:bg-white/10 animate-pulse" />
            <div className="w-32 h-8 rounded-xl bg-black/[0.08] dark:bg-white/10 animate-pulse" />
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="w-full px-6 md:px-10 mt-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column Cards Skeleton */}
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border border-black/10 dark:border-luxury-gold/20 bg-white dark:bg-[#16171b] rounded-3xl p-6 space-y-5 animate-pulse shadow-sm dark:shadow-xl">
                  <div className="flex items-center gap-3 pb-4 border-b border-black/5 dark:border-white/5">
                    <div className="w-5 h-5 rounded bg-black/[0.08] dark:bg-white/10" />
                    <div className="w-36 h-4 bg-black/[0.08] dark:bg-white/10 rounded" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="w-24 h-3 bg-black/[0.08] dark:bg-white/10 rounded" />
                      <div className="w-full h-10 bg-black/[0.05] dark:bg-white/5 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <div className="w-32 h-3 bg-black/[0.08] dark:bg-white/10 rounded" />
                      <div className="w-full h-10 bg-black/[0.05] dark:bg-white/5 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column Cards Skeleton */}
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border border-black/10 dark:border-luxury-gold/20 bg-white dark:bg-[#16171b] rounded-3xl p-6 space-y-5 animate-pulse shadow-sm dark:shadow-xl">
                  <div className="flex items-center gap-3 pb-4 border-b border-black/5 dark:border-white/5">
                    <div className="w-5 h-5 rounded bg-black/[0.08] dark:bg-white/10" />
                    <div className="w-40 h-4 bg-black/[0.08] dark:bg-white/10 rounded" />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-black/[0.05] dark:bg-white/5 rounded-2xl" />
                      <div className="h-16 bg-black/[0.05] dark:bg-white/5 rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <div className="w-28 h-3 bg-black/[0.08] dark:bg-white/10 rounded" />
                      <div className="w-full h-10 bg-black/[0.05] dark:bg-white/5 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarToggle />
          <i className="fa-solid fa-gears text-luxury-gold text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-[#1C1A17] dark:text-white">System Settings</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Logo, Brand Name, Colors, & Socials</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {hasChanges && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-luxury-gold hover:opacity-90 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i> Save Changes
              </>
            )}
          </button>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-luxury-gold transition-all duration-200 border border-white/10 hover:border-luxury-gold/50 rounded-xl px-3.5 py-2 bg-white/5 hover:bg-white/10 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            <span className="hidden sm:inline">View Live Site</span>
          </Link>

          <AdminUserDropdown />
        </div>
      </header>

      <main className="w-full px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form container */}
        <div className="lg:col-span-7 space-y-8 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur shadow-xl">
          <div>
            <h2 className="font-serif text-2xl text-white tracking-wide border-b border-white/10 pb-3 mb-6">
              Branding & System Configuration
            </h2>
          </div>

          {/* Section: Brand Info */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-luxury-gold uppercase flex items-center gap-2">
              <i className="fa-solid fa-signature"></i> Identity Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Brand Name</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Brand Logo</label>
                <div className="flex items-center gap-4 bg-[#16171b] border border-white/10 rounded-xl p-4">
                  <div className="relative flex-1">
                    {brandLogo ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60 truncate max-w-xs md:max-w-md font-mono">
                          {brandLogo.split("/").pop()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBrandLogo("")}
                          className="text-red-500 hover:text-red-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can"></i> Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-white/40 italic">No logo uploaded yet</span>
                    )}
                  </div>
                  <input
                    type="file"
                    id="brandLogoFile"
                    accept="image/*"
                    disabled={isUploadingLogo}
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="brandLogoFile"
                    className="bg-white/5 border border-white/10 hover:border-luxury-gold/50 hover:bg-luxury-gold/10 text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
                  >
                    {isUploadingLogo ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up text-luxury-gold"></i> Upload Logo
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Brand Colors */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-bold tracking-widest text-luxury-gold uppercase flex items-center gap-2">
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
                    className="w-full bg-[#16171b] border border-white/10 focus:border-luxury-gold/50 rounded-lg px-2 text-xs focus:outline-none text-white font-mono uppercase"
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
                    className="w-full bg-[#16171b] border border-white/10 focus:border-luxury-gold/50 rounded-lg px-2 text-xs focus:outline-none text-white font-mono uppercase"
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
                    className="w-full bg-[#16171b] border border-white/10 focus:border-luxury-gold/50 rounded-lg px-2 text-xs focus:outline-none text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Social Links */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-bold tracking-widest text-luxury-gold uppercase flex items-center gap-2">
              <i className="fa-solid fa-share-nodes"></i> Social Media Accounts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Facebook URL</label>
                <input
                  type="text"
                  required
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Instagram URL</label>
                <input
                  type="text"
                  required
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">TikTok URL</label>
                <input
                  type="text"
                  required
                  value={socialTiktok}
                  onChange={(e) => setSocialTiktok(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Twitter / X URL</label>
                <input
                  type="text"
                  required
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-28 bg-white dark:bg-[#16171b] border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-luxury-gold uppercase flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass"></i> Logo & Socials Preview
              </h3>
              <p className="text-[11px] text-[#7A746B] dark:text-white/40 mt-1">Real-time approximation of the main website logo header and social media footer.</p>
            </div>

            {/* Simulated Header Brand Logo */}
            <div className="bg-[#FAF8F5] dark:bg-[#0b0c10] border border-black/10 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-inner text-center transition-colors duration-300">
              <span className="text-[9px] uppercase tracking-widest text-[#7A746B] dark:text-white/40 font-bold block">
                Website Header Brand
              </span>

              {/* Main Adaptive Header Display */}
              <div className="flex items-center gap-3">
                {brandLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brandLogo}
                    alt="Logo Preview"
                    className="w-8 h-8 object-contain rounded"
                  />
                ) : (
                  <svg style={{ color: themeColorPrimary }} className="w-8 h-8 filter drop-shadow transition-colors duration-300" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 5 L85 25 L85 65 L50 95 L15 65 L15 25 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="48" r="8" fill="currentColor" />
                  </svg>
                )}
                <span className="font-serif text-lg tracking-[0.2em] uppercase font-semibold transition-colors duration-300">
                  <span className="text-[#1C1A17] dark:text-white transition-colors duration-300">
                    {brandName.split(" ")[0]}
                  </span>{" "}
                  <span style={{ color: themeColorPrimary }} className="transition-colors duration-300">
                    {brandName.split(" ").slice(1).join(" ")}
                  </span>
                </span>
              </div>
            </div>

            {/* Simulated Footer Social Icons */}
            <div className="bg-[#FAF8F5] dark:bg-[#0b0c10] border border-black/10 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-inner text-center">
              <span className="text-[9px] uppercase tracking-widest text-[#7A746B] dark:text-white/40 font-bold block">Footer Social Links</span>
              <div className="flex gap-6 justify-center">
                <a href={socialInstagram} target="_blank" rel="noopener noreferrer" style={{ color: themeColorPrimary }} className="text-xl hover:opacity-80 transition-opacity">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href={socialFacebook} target="_blank" rel="noopener noreferrer" style={{ color: themeColorPrimary }} className="text-xl hover:opacity-80 transition-opacity">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href={socialTiktok} target="_blank" rel="noopener noreferrer" style={{ color: themeColorPrimary }} className="text-xl hover:opacity-80 transition-opacity">
                  <i className="fa-brands fa-tiktok"></i>
                </a>
                <a href={socialTwitter} target="_blank" rel="noopener noreferrer" style={{ color: themeColorPrimary }} className="text-xl hover:opacity-80 transition-opacity">
                  <i className="fa-brands fa-twitter"></i>
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
