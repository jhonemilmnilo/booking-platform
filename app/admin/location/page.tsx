"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/auth/actions"
import { getClientCachedSettings, setClientCachedSettings } from "@/lib/client-cache"
import { AdminSidebarToggle } from "@/app/admin/_components/admin-shell"
import AdminUserDropdown from "@/app/admin/_components/admin-user-dropdown"

interface TouristSpot {
  name: string
  distance: string
}

export default function AdminLocationPage() {
  // ─── Initial Hydration from Cache ───────────────────────────────────────────
  const [resortLatitude, setResortLatitude] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.resortLatitude) return c.resortLatitude
    }
    return "16.1651539"
  })

  const [resortLongitude, setResortLongitude] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.resortLongitude) return c.resortLongitude
    }
    return "119.7698115"
  })

  const [resortRegion, setResortRegion] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.resortRegion) return c.resortRegion
    }
    return "Pangasinan"
  })

  const [titleLine1, setTitleLine1] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.resortLocationTitleLine1) return c.resortLocationTitleLine1
    }
    return "Poised Above the"
  })

  const [titleLine2, setTitleLine2] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.resortLocationTitleLine2) return c.resortLocationTitleLine2
    }
    return "Aegean Horizon"
  })

  const [description, setDescription] = React.useState(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.resortLocationDescription) return c.resortLocationDescription
    }
    return "Accessible directly via scenic coastal highways, private yacht tenders, or our beachside boardwalk. Our resort occupies a prime oceanfront location offering unrivaled panoramic views while staying secluded in a private sandy cove."
  })

  const [touristSpots, setTouristSpots] = React.useState<TouristSpot[]>(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.touristSpots) {
        try {
          const parsed = JSON.parse(c.touristSpots)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } catch {}
      }
    }
    return [
      { name: "Abagatanen White Beach", distance: "1 min Walk" },
      { name: "Agno Umbrella Rocks", distance: "8 mins Shore Drive" },
      { name: "Bani Olanen Beach", distance: "12 mins Drive" },
      { name: "Hundred Islands (Alaminos)", distance: "35 mins Resort Shuttle" },
      { name: "Cape Bolinao Lighthouse", distance: "45 mins Private Charter" }
    ]
  })

  // ─── Component State ────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [selectedSpotPreview, setSelectedSpotPreview] = React.useState<TouristSpot | null>(null)
  const [isRawMode, setIsRawMode] = React.useState(false)
  const [rawText, setRawText] = React.useState("")

  // Initial fetch from database
  React.useEffect(() => {
    getSystemSettingsAction()
      .then((settings) => {
        if (settings.resortLatitude) setResortLatitude(settings.resortLatitude)
        if (settings.resortLongitude) setResortLongitude(settings.resortLongitude)
        if (settings.resortRegion) setResortRegion(settings.resortRegion)
        if (settings.resortLocationTitleLine1) setTitleLine1(settings.resortLocationTitleLine1)
        if (settings.resortLocationTitleLine2) setTitleLine2(settings.resortLocationTitleLine2)
        if (settings.resortLocationDescription) setDescription(settings.resortLocationDescription)

        if (settings.touristSpots) {
          try {
            const parsed = JSON.parse(settings.touristSpots)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setTouristSpots(parsed)
            }
          } catch (e) {
            console.error("Failed to parse tourist spots JSON:", e)
          }
        }
        setHasChanges(false)
        setClientCachedSettings(settings)
      })
      .catch((err) => {
        console.error("[AdminLocation] Load error:", err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Sync rawText when touristSpots changes
  React.useEffect(() => {
    setRawText(touristSpots.map((s) => `${s.name}: ${s.distance}`).join("\n"))
  }, [touristSpots])

  // ─── Form Handlers ──────────────────────────────────────────────────────────
  const handleSpotChange = (index: number, field: keyof TouristSpot, val: string) => {
    setTouristSpots((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: val }
      return next
    })
    setHasChanges(true)
  }

  const handleAddSpot = () => {
    setTouristSpots((prev) => [
      ...prev,
      { name: "New Scenic Destination", distance: "10 mins Drive" }
    ])
    setHasChanges(true)
  }

  const handleRemoveSpot = (index: number) => {
    setTouristSpots((prev) => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const handleMoveSpot = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === touristSpots.length - 1) return

    setTouristSpots((prev) => {
      const next = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      const temp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = temp
      return next
    })
    setHasChanges(true)
  }

  const handleRawTextChange = (text: string) => {
    setRawText(text)
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
    const parsed = lines.map((line) => {
      const parts = line.split(":")
      return {
        name: parts[0]?.trim() ?? "",
        distance: parts.slice(1).join(":")?.trim() ?? "5 mins"
      }
    })
    setTouristSpots(parsed)
    setHasChanges(true)
  }

  // ─── Save All ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const lat = resortLatitude.trim()
    const lng = resortLongitude.trim()

    const isValidCoord = (v: string) => !isNaN(parseFloat(v)) && isFinite(Number(v))
    if (!isValidCoord(lat) || !isValidCoord(lng)) {
      toast.error("Please enter valid decimal coordinates for Latitude and Longitude.")
      return
    }

    setIsSaving(true)
    try {
      const payload: Record<string, string> = {
        resort_latitude: lat,
        resort_longitude: lng,
        resort_region: resortRegion.trim(),
        resort_location_title_line_1: titleLine1.trim(),
        resort_location_title_line_2: titleLine2.trim(),
        resort_location_description: description.trim(),
        tourist_spots: JSON.stringify(touristSpots),
      }

      const res = await updateSystemSettingsAction(payload)
      if (res.success) {
        setHasChanges(false)
        toast.success("Location coordinates and attractions saved successfully!")
      } else {
        toast.error(`Save failed: ${res.error}`)
      }
    } catch (err) {
      console.error("[AdminLocation] Save error:", err)
      toast.error("An error occurred while saving.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    const c = getClientCachedSettings()
    if (c) {
      if (c.resortLatitude) setResortLatitude(c.resortLatitude)
      if (c.resortLongitude) setResortLongitude(c.resortLongitude)
      if (c.resortRegion) setResortRegion(c.resortRegion)
      if (c.resortLocationTitleLine1) setTitleLine1(c.resortLocationTitleLine1)
      if (c.resortLocationTitleLine2) setTitleLine2(c.resortLocationTitleLine2)
      if (c.resortLocationDescription) setDescription(c.resortLocationDescription)
      if (c.touristSpots) {
        try {
          const parsed = JSON.parse(c.touristSpots)
          if (Array.isArray(parsed)) setTouristSpots(parsed)
        } catch {}
      }
    }
    setHasChanges(false)
    setSelectedSpotPreview(null)
    toast.info("Changes reverted.")
  }

  // Map Iframe calculation
  const regionSuffix = resortRegion ? `, ${resortRegion}` : ""
  const mapSrc = selectedSpotPreview
    ? `https://maps.google.com/maps?saddr=${encodeURIComponent(resortLatitude.trim() + "," + resortLongitude.trim())}&daddr=${encodeURIComponent(selectedSpotPreview.name + regionSuffix)}&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(resortLatitude.trim() + "," + resortLongitude.trim())}&z=15&output=embed`

  // ─── Skeleton Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    const Bone = ({ className = "" }: { className?: string }) => (
      <div className={`bg-black/[0.08] dark:bg-white/[0.06] rounded-xl animate-pulse ${className}`} />
    )

    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
        <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AdminSidebarToggle />
            <Bone className="w-7 h-7 rounded-lg" />
            <div className="space-y-1.5">
              <Bone className="w-44 h-4 rounded-lg" />
              <Bone className="w-32 h-2.5 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Bone className="w-28 h-8 rounded-xl" />
            <Bone className="w-32 h-8 rounded-xl" />
          </div>
        </header>

        <main className="w-full px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl">
            <Bone className="w-56 h-7 rounded-xl" />
            <div className="space-y-4">
              <Bone className="w-full h-12 rounded-xl" />
              <Bone className="w-full h-12 rounded-xl" />
              <Bone className="w-full h-32 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-[#16171b] border border-black/10 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm dark:shadow-xl">
              <Bone className="w-48 h-5 rounded-lg" />
              <Bone className="w-full h-80 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ─── Render Page ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarToggle />
          <i className="fa-solid fa-map-location-dot text-luxury-gold text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-[#1C1A17] dark:text-white">Location & Attractions</h1>
            <p className="text-[10px] text-[#7A746B] dark:text-white/40 uppercase tracking-widest font-semibold">
              Resort Coordinates, Map & Regional Guide
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {hasChanges && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-amber-500 dark:text-amber-400 font-semibold uppercase tracking-widest animate-pulse mr-1">
              <i className="fa-solid fa-circle-dot text-[8px]"></i> Unsaved changes
            </span>
          )}

          {hasChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 text-[#5C564F] dark:text-white/70 hover:text-[#1C1A17] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Discard
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
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
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C564F] dark:text-white/80 hover:text-luxury-gold transition-all duration-200 border border-black/10 dark:border-white/10 hover:border-luxury-gold/50 rounded-xl px-3.5 py-2 bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            <span className="hidden sm:inline">View Live Site</span>
          </Link>

          <AdminUserDropdown />
        </div>
      </header>

      {/* ── Main Content Grid ───────────────────────────────────────────────── */}
      <main className="w-full px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Coordinates, Editorial Narrative & Tourist Attractions */}
        <div className="lg:col-span-7 space-y-8">
          {/* Card 1: Geographical GPS & Map Settings */}
          <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur shadow-sm dark:shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <h2 className="font-serif text-xl text-[#1C1A17] dark:text-white tracking-wide flex items-center gap-2.5">
                  <i className="fa-solid fa-compass text-luxury-gold text-sm"></i>
                  Geographic Coordinates & Anchor
                </h2>
                <p className="text-xs text-[#7A746B] dark:text-white/40 mt-0.5">
                  Configure GPS coordinates for the interactive Google Map pin and directions router.
                </p>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(resortLatitude.trim() + "," + resortLongitude.trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-luxury-gold hover:opacity-80 uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                title="Verify location in Google Maps"
              >
                <span>Google Maps</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">
                  Resort Latitude <span className="text-luxury-gold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={resortLatitude}
                    onChange={(e) => {
                      setResortLatitude(e.target.value)
                      setHasChanges(true)
                    }}
                    placeholder="e.g. 16.1651539"
                    className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white font-mono"
                  />
                  <span className="absolute right-3.5 top-3.5 text-[#7A746B] dark:text-white/30 text-xs font-mono">LAT</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">
                  Resort Longitude <span className="text-luxury-gold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={resortLongitude}
                    onChange={(e) => {
                      setResortLongitude(e.target.value)
                      setHasChanges(true)
                    }}
                    placeholder="e.g. 119.7698115"
                    className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white font-mono"
                  />
                  <span className="absolute right-3.5 top-3.5 text-[#7A746B] dark:text-white/30 text-xs font-mono">LNG</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">
                Region / Province <span className="text-[#7A746B] dark:text-white/30 normal-case font-normal">(Used for transit query routing)</span>
              </label>
              <input
                type="text"
                value={resortRegion}
                onChange={(e) => {
                  setResortRegion(e.target.value)
                  setHasChanges(true)
                }}
                placeholder="e.g. Pangasinan"
                className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white"
              />
            </div>
          </div>

          {/* Card 2: Location Narrative & Hero Typography */}
          <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur shadow-sm dark:shadow-xl space-y-6">
            <div className="border-b border-black/10 dark:border-white/10 pb-4">
              <h2 className="font-serif text-xl text-[#1C1A17] dark:text-white tracking-wide flex items-center gap-2.5">
                <i className="fa-solid fa-pen-fancy text-luxury-gold text-sm"></i>
                Location Editorial & Headline
              </h2>
              <p className="text-xs text-[#7A746B] dark:text-white/40 mt-0.5">
                Editorial title and arrival narrative displayed to guests above the interactive map.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">
                  Headline Line 1
                </label>
                <input
                  type="text"
                  value={titleLine1}
                  onChange={(e) => {
                    setTitleLine1(e.target.value)
                    setHasChanges(true)
                  }}
                  placeholder="e.g. Poised Above the"
                  className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">
                  Headline Line 2 <span className="text-luxury-gold">(Gold Italicized)</span>
                </label>
                <input
                  type="text"
                  value={titleLine2}
                  onChange={(e) => {
                    setTitleLine2(e.target.value)
                    setHasChanges(true)
                  }}
                  placeholder="e.g. Aegean Horizon"
                  className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white font-serif italic"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">
                Arrival Narrative / Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setHasChanges(true)
                }}
                placeholder="Describe how guests can access the resort (coastal highways, yachts, shuttle)..."
                className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Card 3: Nearby Attractions & Destinations */}
          <div className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur shadow-sm dark:shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <h2 className="font-serif text-xl text-[#1C1A17] dark:text-white tracking-wide flex items-center gap-2.5">
                  <i className="fa-solid fa-umbrella-beach text-luxury-gold text-sm"></i>
                  Nearby Attractions & Transit Times
                </h2>
                <p className="text-xs text-[#7A746B] dark:text-white/40 mt-0.5">
                  Add local beaches, islands, and scenic landmarks that guests can click on to generate driving routes.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsRawMode((prev) => !prev)}
                  className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:border-luxury-gold text-[11px] font-semibold text-[#5C564F] dark:text-white/70 hover:text-[#1C1A17] dark:hover:text-white bg-black/[0.03] dark:bg-white/5 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-code text-[10px] mr-1"></i>
                  {isRawMode ? "Form View" : "Raw Mode"}
                </button>

                <button
                  type="button"
                  onClick={handleAddSpot}
                  className="px-3 py-1.5 rounded-lg bg-luxury-gold/15 hover:bg-luxury-gold/25 border border-luxury-gold/40 text-luxury-gold text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-plus text-[10px]"></i>
                  Add Spot
                </button>
              </div>
            </div>

            {isRawMode ? (
              <div>
                <label className="block text-xs font-semibold text-[#5C564F] dark:text-white/60 mb-2 uppercase tracking-wide">
                  Bulk List Editor <span className="text-[#7A746B] dark:text-white/30 normal-case font-normal">(Format: Spot Name: Transit Time)</span>
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => handleRawTextChange(e.target.value)}
                  placeholder={"Abagatanen White Beach: 1 min Walk\nAgno Umbrella Rocks: 8 mins Shore Drive"}
                  className="w-full bg-[#F5F2EB] dark:bg-[#16171b] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors text-[#1C1A17] dark:text-white font-mono resize-none leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {touristSpots.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-black/15 dark:border-white/10 rounded-2xl">
                    <i className="fa-solid fa-map-pin text-black/20 dark:text-white/20 text-3xl mb-3 block"></i>
                    <p className="text-sm text-[#7A746B] dark:text-white/40">No nearby attractions configured.</p>
                    <button
                      type="button"
                      onClick={handleAddSpot}
                      className="mt-3 text-xs text-luxury-gold hover:underline font-semibold"
                    >
                      + Add the first attraction
                    </button>
                  </div>
                ) : (
                  touristSpots.map((spot, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-2xl bg-[#F8F6F0] dark:bg-[#16171b] border border-black/5 dark:border-white/5 hover:border-luxury-gold/40 transition-all group"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] font-mono text-[#7A746B] dark:text-white/40 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveSpot(idx, "up")}
                            disabled={idx === 0}
                            title="Move up"
                            className="w-5 h-4 text-[#7A746B] dark:text-white/30 hover:text-luxury-gold disabled:opacity-20 flex items-center justify-center cursor-pointer"
                          >
                            <i className="fa-solid fa-chevron-up text-[9px]"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSpot(idx, "down")}
                            disabled={idx === touristSpots.length - 1}
                            title="Move down"
                            className="w-5 h-4 text-[#7A746B] dark:text-white/30 hover:text-luxury-gold disabled:opacity-20 flex items-center justify-center cursor-pointer"
                          >
                            <i className="fa-solid fa-chevron-down text-[9px]"></i>
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 min-w-0">
                        <div className="sm:col-span-7">
                          <input
                            type="text"
                            value={spot.name}
                            onChange={(e) => handleSpotChange(idx, "name", e.target.value)}
                            placeholder="Destination or beach name"
                            className="w-full bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors text-[#1C1A17] dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={spot.distance}
                            onChange={(e) => handleSpotChange(idx, "distance", e.target.value)}
                            placeholder="e.g. 5 mins Walk"
                            className="w-full bg-white dark:bg-[#121316] border border-black/10 dark:border-white/10 focus:border-luxury-gold rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors text-luxury-gold font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => setSelectedSpotPreview(spot)}
                          title="Simulate direction on map"
                          className="px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-luxury-gold/20 text-[#5C564F] dark:text-white/50 hover:text-luxury-gold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <i className="fa-solid fa-route text-[11px]"></i>
                          <span className="text-[10px] hidden md:inline">Test Route</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpot(idx)}
                          title="Delete destination"
                          className="w-7 h-7 rounded-lg text-[#7A746B] dark:text-white/30 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Live Simulator & Guest Experience Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 bg-white dark:bg-[#16171b] border border-black/10 dark:border-white/10 rounded-3xl p-6 shadow-md dark:shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div>
                <h3 className="font-serif text-base text-[#1C1A17] dark:text-white tracking-wide flex items-center gap-2">
                  <i className="fa-solid fa-satellite-dish text-luxury-gold text-xs"></i>
                  Live Map Simulation
                </h3>
                <p className="text-[11px] text-[#7A746B] dark:text-white/40">
                  {selectedSpotPreview
                    ? `Routing: Resort → ${selectedSpotPreview.name}`
                    : "Displaying resort location pin"}
                </p>
              </div>

              {selectedSpotPreview && (
                <button
                  type="button"
                  onClick={() => setSelectedSpotPreview(null)}
                  className="px-2.5 py-1 rounded-lg bg-luxury-gold/15 text-luxury-gold hover:bg-luxury-gold hover:text-white text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <i className="fa-solid fa-rotate-left text-[9px]"></i>
                  Reset Pin
                </button>
              )}
            </div>

            {/* Google Map Viewport: Natural in Light, Stylized Inverted in Dark */}
            <div className="relative h-[290px] rounded-2xl overflow-hidden border border-luxury-gold/30 bg-[#F5F2EB] dark:bg-[#0c0d10] shadow-inner">
              <iframe
                key={`${resortLatitude},${resortLongitude},${selectedSpotPreview?.name || "root"}`}
                src={mapSrc}
                className="absolute inset-0 w-full h-full border-none filter-none dark:filter dark:invert-[90%] dark:hue-rotate-[180deg] dark:saturate-[40%] dark:contrast-[95%] dark:brightness-[90%]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Coordinates Pill */}
              <div className="absolute top-3 right-3 bg-white/95 dark:bg-black/80 border border-luxury-gold/40 px-2.5 py-1 rounded-lg text-[9px] font-mono text-luxury-gold flex items-center gap-1.5 backdrop-blur-md shadow-md select-all z-20">
                <i className="fa-solid fa-crosshairs text-[8px]"></i>
                <span>{resortLatitude}, {resortLongitude}</span>
              </div>

              {/* Region Pill */}
              <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-black/80 border border-black/10 dark:border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-[#1C1A17] dark:text-white/60 flex items-center gap-1.5 backdrop-blur-md shadow-md z-20">
                <i className="fa-solid fa-location-dot text-luxury-gold text-[9px]"></i>
                <span>{resortRegion || "Region"}</span>
              </div>
            </div>

            {/* Guest Experience Live Preview Card */}
            <div className="rounded-2xl bg-[#F8F6F0] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-luxury-gold uppercase tracking-[0.25em] text-[9px] font-semibold block">
                  Public Guest View Preview
                </span>
                <h4 className="font-serif text-lg text-[#1C1A17] dark:text-white leading-tight">
                  {titleLine1 || "Poised Above the"}{" "}
                  <span className="bg-clip-text text-transparent text-gold-gradient italic">
                    {titleLine2 || "Aegean Horizon"}
                  </span>
                </h4>
              </div>

              <p className="text-[#5C564F] dark:text-white/60 text-xs leading-relaxed font-light line-clamp-3">
                {description || "Accessible directly via scenic coastal highways, private yacht tenders, or our beachside boardwalk..."}
              </p>

              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-luxury-gold uppercase tracking-wider font-semibold">
                  <span>Attractions ({touristSpots.length})</span>
                  <span className="text-[#7A746B] dark:text-white/30 text-[9px] lowercase font-normal">(click to preview route)</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {touristSpots.map((spot, i) => {
                    const isSelected = selectedSpotPreview?.name === spot.name
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedSpotPreview(spot)}
                        className={`w-full text-left flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-luxury-gold/20 text-luxury-gold font-bold border border-luxury-gold/40"
                            : "hover:bg-black/5 dark:hover:bg-white/5 text-[#1C1A17]/80 dark:text-white/70 hover:text-[#1C1A17] dark:hover:text-white"
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5 min-w-0">
                          <i className={`fa-solid fa-location-dot text-[9px] ${isSelected ? "text-luxury-gold" : "text-luxury-gold/50"}`}></i>
                          <span className="truncate">{spot.name}</span>
                        </span>
                        <span className="text-[11px] text-luxury-gold shrink-0 ml-2 font-medium">
                          {spot.distance}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
