"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getSystemSettingsAction, updateSystemSettingsAction, uploadBrandLogoAction } from "@/app/auth/actions"

export default function GeneralSystemSettingsPage() {
  const router = useRouter()

  // General settings states
  const [brandName, setBrandName] = React.useState("Ocean Hill")
  const [brandLogo, setBrandLogo] = React.useState("")
  
  const [themeColorPrimary, setThemeColorPrimary] = React.useState("#D4AF37")
  const [themeColorSecondary, setThemeColorSecondary] = React.useState("#FFFFFF")
  const [themeColorAccent, setThemeColorAccent] = React.useState("#1C1A17")
  
  const [socialFacebook, setSocialFacebook] = React.useState("https://facebook.com")
  const [socialInstagram, setSocialInstagram] = React.useState("https://instagram.com")
  const [socialTiktok, setSocialTiktok] = React.useState("https://tiktok.com")
  const [socialTwitter, setSocialTwitter] = React.useState("https://twitter.com")

  const [isLoading, setIsLoading] = React.useState(true)
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)

  // Fetch current settings on mount
  React.useEffect(() => {
    getSystemSettingsAction()
      .then((settings) => {
        setBrandName(settings.brandName)
        setBrandLogo(settings.brandLogo)
        setThemeColorPrimary(settings.themeColorPrimary)
        setThemeColorSecondary(settings.themeColorSecondary)
        setThemeColorAccent(settings.themeColorAccent)
        setSocialFacebook(settings.socialFacebook)
        setSocialInstagram(settings.socialInstagram)
        setSocialTiktok(settings.socialTiktok)
        setSocialTwitter(settings.socialTwitter)
      })
      .catch((err) => {
        console.error("[GeneralSettings] Error fetching settings:", err)
        toast.error("Failed to load existing brand configurations.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

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
      await saveSettingDirectly("brand_logo", result.publicUrl)
      toast.success("Brand logo successfully uploaded!", { id: toastId })
    } catch (err) {
      console.error("[GeneralSettings] Logo upload error:", err)
      toast.error(err instanceof Error ? err.message : "Failed to upload logo image.", { id: toastId })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-[#D4AF37]"></i>
          <span className="text-sm tracking-widest uppercase font-semibold text-white/60">Retrieving System Settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#EAE5D9] font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-[#D4AF37]/20 bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-gears text-[#D4AF37] text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-white">System Settings</h1>
            <p className="text-[10px] text-white/50 tracking-widest uppercase font-bold">Logo, Brand Name, Colors, & Socials</p>
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
              Branding & System Configuration
            </h2>
          </div>

          {/* Section: Brand Info */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
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
                  onBlur={(e) => saveSettingDirectly("brand_name", e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white"
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
                          onClick={() => {
                            setBrandLogo("")
                            saveSettingDirectly("brand_logo", "")
                          }}
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
                    className="bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 text-white font-semibold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
                  >
                    {isUploadingLogo ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up text-[#D4AF37]"></i> Upload Logo
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Brand Colors */}
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
                    onBlur={(e) => saveSettingDirectly("theme_color_primary", e.target.value)}
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
                    onBlur={(e) => saveSettingDirectly("theme_color_secondary", e.target.value)}
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
                    onBlur={(e) => saveSettingDirectly("theme_color_accent", e.target.value)}
                    className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-lg px-2 text-xs focus:outline-none text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Social Links */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
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
                  onBlur={(e) => saveSettingDirectly("social_facebook", e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Instagram URL</label>
                 <input
                  type="text"
                  required
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  onBlur={(e) => saveSettingDirectly("social_instagram", e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">TikTok URL</label>
                 <input
                  type="text"
                  required
                  value={socialTiktok}
                  onChange={(e) => setSocialTiktok(e.target.value)}
                  onBlur={(e) => saveSettingDirectly("social_tiktok", e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Twitter / X URL</label>
                 <input
                  type="text"
                  required
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  onBlur={(e) => saveSettingDirectly("social_twitter", e.target.value)}
                  className="w-full bg-[#16171b] border border-white/10 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-white font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-28 bg-[#16171b] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                <i className="fa-solid fa-magnifying-glass"></i> Logo & Socials Preview
              </h3>
              <p className="text-[11px] text-white/40 mt-1">Real-time approximation of the main website logo header and social media footer.</p>
            </div>

            {/* Simulated Header Brand Logo */}
            <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-6 shadow-inner text-center">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block">Website Header Brand</span>
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
                <span
                  style={{ color: themeColorSecondary }}
                  className="font-serif text-lg tracking-[0.2em] uppercase font-semibold transition-colors duration-300"
                >
                  {brandName.split(" ")[0]} <span style={{ color: themeColorPrimary }} className="transition-colors duration-300">{brandName.split(" ").slice(1).join(" ")}</span>
                </span>
              </div>
            </div>

            {/* Simulated Footer Social Icons */}
            <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-inner text-center">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block">Footer Social Links</span>
              <div className="flex gap-6 justify-center">
                <a href={socialInstagram} target="_blank" rel="noopener noreferrer" style={{ color: themeColorPrimary }} className="text-xl hover:text-white transition-colors">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href={socialFacebook} target="_blank" rel="noopener noreferrer" style={{ color: themeColorPrimary }} className="text-xl hover:text-white transition-colors">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href={socialTiktok} target="_blank" rel="noopener noreferrer" style={{ color: themeColorPrimary }} className="text-xl hover:text-white transition-colors">
                  <i className="fa-brands fa-tiktok"></i>
                </a>
                <a href={socialTwitter} target="_blank" rel="noopener noreferrer" style={{ color: themeColorPrimary }} className="text-xl hover:text-white transition-colors">
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
