"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/auth/actions"
import { getClientCachedSettings, setClientCachedSettings } from "@/lib/client-cache"
import { AdminSidebarToggle } from "@/app/admin/_components/admin-shell"
import AdminUserDropdown from "@/app/admin/_components/admin-user-dropdown"
import { AmenityItem } from "@/app/(main)/_sections/amenities"

const AVAILABLE_ICONS = [
  { icon: "fa-umbrella-beach", label: "Beach Umbrella" },
  { icon: "fa-water", label: "Water / Waves" },
  { icon: "fa-person-swimming", label: "Pool / Swimming" },
  { icon: "fa-ship", label: "Yacht / Boat" },
  { icon: "fa-sailboat", label: "Sailboat" },
  { icon: "fa-utensils", label: "Gourmet Dining" },
  { icon: "fa-martini-glass-citrus", label: "Cocktail Bar" },
  { icon: "fa-champagne-glasses", label: "Champagne / Wine" },
  { icon: "fa-spa", label: "Spa & Pavilion" },
  { icon: "fa-hot-tub-person", label: "Jacuzzi / Sauna" },
  { icon: "fa-heart-pulse", label: "Wellness / Health" },
  { icon: "fa-dumbbell", label: "Fitness Gym" },
  { icon: "fa-van-shuttle", label: "Resort Shuttle" },
  { icon: "fa-helicopter", label: "Helipad Transfer" },
  { icon: "fa-concierge-bell", label: "Concierge / Butler" },
  { icon: "fa-sun", label: "Sunrise / Sunset" },
  { icon: "fa-tree", label: "Garden / Nature" },
  { icon: "fa-fire", label: "Bonfire / Firepit" },
  { icon: "fa-music", label: "Acoustic / Live Music" },
  { icon: "fa-gem", label: "VIP / Diamond" },
]

const CATEGORY_OPTIONS = [
  { id: "beach", label: "Beach & Ocean" },
  { id: "wellness", label: "Wellness & Spa" },
  { id: "dining", label: "Dining & Libations" },
]

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = React.useState<AmenityItem[]>(() => {
    if (typeof window !== "undefined") {
      const c = getClientCachedSettings()
      if (c?.resortAmenities) {
        try {
          const parsed = JSON.parse(c.resortAmenities)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        } catch {}
      }
    }
    return [
      {
        id: "beach-club",
        title: "Private Beach Club",
        subtitle: "Pristine Sands & Daybeds",
        description: "Enjoy exclusive access to our secluded white sand cove, fully serviced with luxury loungers, double daybeds, and dedicated beachside concierges.",
        category: "beach",
        categoryLabel: "Beachfront",
        icon: "fa-umbrella-beach",
        hours: "6:00 AM – 7:00 PM",
        perks: ["Private Cove", "Double Daybeds", "Butler Service"],
        highlightBadge: "Signature",
      },
      {
        id: "water-sports",
        title: "Water Sports & Charters",
        subtitle: "Coastal Exploration",
        description: "Paddleboards, sea kayaks, and custom luxury yacht charters are available directly from the private resort pier for bespoke ocean exploration.",
        category: "beach",
        categoryLabel: "Sea Adventures",
        icon: "fa-ship",
        hours: "8:00 AM – 5:00 PM",
        perks: ["Private Yachts", "Sea Kayaks", "Guided Reef Tours"],
      },
      {
        id: "fine-dining",
        title: "Fine Oceanfront Dining",
        subtitle: "Mediterranean Gastronomy",
        description: "Indulge in gourmet Mediterranean cuisine crafted from locally sourced coastal ingredients, served directly over the water under the evening stars.",
        category: "dining",
        categoryLabel: "Gourmet Dining",
        icon: "fa-utensils",
        hours: "11:30 AM – 11:00 PM",
        perks: ["Michelin-Caliber Chefs", "Overwater Deck", "Private Cellar"],
        highlightBadge: "Award Winning",
      },
      {
        id: "poolside-loungers",
        title: "Poolside Loungers & Cabanas",
        subtitle: "Lagoon & Infinity Terraces",
        description: "Relax beside our multi-tiered heated lagoon and infinity pools, featuring shaded luxury cabanas, chilled towel service, and panoramic ocean vistas.",
        category: "wellness",
        categoryLabel: "Relaxation",
        icon: "fa-water",
        hours: "7:00 AM – 10:00 PM",
        perks: ["Infinity Edge", "Heated Waters", "Chilled Towels"],
      },
      {
        id: "wellness-spa",
        title: "Wellness & Spa Pavilion",
        subtitle: "Holistic Rejuvenation",
        description: "Experience world-class massage therapy, Himalayan salt saunas, and sensory wellness treatments designed to restore body and mind right on the shore.",
        category: "wellness",
        categoryLabel: "Holistic Health",
        icon: "fa-spa",
        hours: "9:00 AM – 9:00 PM",
        perks: ["Herbal Steam", "Deep Tissue Massage", "Sound Healing"],
        highlightBadge: "Holistic",
      },
      {
        id: "sunset-bar",
        title: "Sunset Cabana Bar",
        subtitle: "Artisanal Libations",
        description: "Sip custom botanical cocktails, fresh cold-pressed tropical juices, and vintage reserve wines served directly to your lounge chair by master mixologists.",
        category: "dining",
        categoryLabel: "Seaside Drinks",
        icon: "fa-martini-glass-citrus",
        hours: "3:00 PM – Midnight",
        perks: ["Master Mixology", "Craft Botanical Cocktails", "Sunset DJ Sets"],
      },
    ]
  })

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [filterCategory, setFilterCategory] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [previewMode, setPreviewMode] = React.useState<"cards" | "guest">("cards")

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<AmenityItem | null>(null)
  const [formId, setFormId] = React.useState("")
  const [formTitle, setFormTitle] = React.useState("")
  const [formSubtitle, setFormSubtitle] = React.useState("")
  const [formDescription, setFormDescription] = React.useState("")
  const [formCategory, setFormCategory] = React.useState<string>("beach")
  const [formCategoryLabel, setFormCategoryLabel] = React.useState("Beachfront")
  const [formIcon, setFormIcon] = React.useState("fa-umbrella-beach")
  const [formHours, setFormHours] = React.useState("6:00 AM – 7:00 PM")
  const [formHighlightBadge, setFormHighlightBadge] = React.useState("")
  const [formPerks, setFormPerks] = React.useState<string[]>([])
  const [newPerkInput, setNewPerkInput] = React.useState("")

  // Fetch settings from server
  React.useEffect(() => {
    let isMounted = true
    async function fetchServerSettings() {
      try {
        const settings = await getSystemSettingsAction()
        if (!isMounted) return

        if (settings.resortAmenities) {
          try {
            const parsed = JSON.parse(settings.resortAmenities)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAmenities(parsed)
            }
          } catch {}
        }
      } catch (err) {
        console.error("[AdminAmenities] Failed to fetch settings:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchServerSettings()
    return () => {
      isMounted = false
    }
  }, [])

  // Open modal for new amenity
  const handleAddNew = () => {
    setEditingItem(null)
    const newId = `amenity-${Date.now().toString(36)}`
    setFormId(newId)
    setFormTitle("")
    setFormSubtitle("")
    setFormDescription("")
    setFormCategory("beach")
    setFormCategoryLabel("Beachfront")
    setFormIcon("fa-umbrella-beach")
    setFormHours("7:00 AM – 9:00 PM")
    setFormHighlightBadge("")
    setFormPerks(["Exclusive Access", "Personal Concierge"])
    setNewPerkInput("")
    setIsModalOpen(true)
  }

  // Open modal for editing
  const handleEdit = (item: AmenityItem) => {
    setEditingItem(item)
    setFormId(item.id)
    setFormTitle(item.title)
    setFormSubtitle(item.subtitle)
    setFormDescription(item.description)
    setFormCategory(item.category)
    setFormCategoryLabel(item.categoryLabel)
    setFormIcon(item.icon)
    setFormHours(item.hours)
    setFormHighlightBadge(item.highlightBadge || "")
    setFormPerks([...item.perks])
    setNewPerkInput("")
    setIsModalOpen(true)
  }

  // Persist amenities changes immediately to Database & Client Cache
  const persistAmenities = async (newAmenities: AmenityItem[], successMessage?: string) => {
    setIsSaving(true)
    try {
      const jsonString = JSON.stringify(newAmenities)
      const res = await updateSystemSettingsAction({
        resort_amenities: jsonString,
      })

      if (res.success) {
        const currentCache = getClientCachedSettings() || {}
        setClientCachedSettings({
          ...currentCache,
          resortAmenities: jsonString,
        })
        setAmenities(newAmenities)
        if (successMessage) toast.success(successMessage)
        return true
      } else {
        toast.error(res.error || "Failed to save amenities.")
        return false
      }
    } catch (err) {
      console.error("[AdminAmenities] Persist error:", err)
      toast.error("Failed to persist changes.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Save modal form directly to Database
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error("Please enter a title for the amenity.")
      return
    }

    const updatedItem: AmenityItem = {
      id: formId || `amenity-${Date.now().toString(36)}`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim() || "Exclusive Resort Amenity",
      description: formDescription.trim(),
      category: formCategory as any,
      categoryLabel: formCategoryLabel.trim() || "Resort Amenity",
      icon: formIcon,
      hours: formHours.trim() || "Inquire with Concierge",
      perks: formPerks.filter(Boolean),
      highlightBadge: formHighlightBadge.trim() ? formHighlightBadge.trim() : undefined,
    }

    const nextList = editingItem
      ? amenities.map((item) => (item.id === editingItem.id ? updatedItem : item))
      : [...amenities, updatedItem]

    const ok = await persistAmenities(
      nextList,
      editingItem ? `Updated "${updatedItem.title}"` : `Added "${updatedItem.title}"`
    )

    if (ok) {
      setIsModalOpen(false)
    }
  }

  // Delete Amenity directly
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return
    const nextList = amenities.filter((a) => a.id !== id)
    await persistAmenities(nextList, `Removed "${title}"`)
  }

  // Move Up / Move Down directly
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= amenities.length) return
    const updated = [...amenities]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    await persistAmenities(updated)
  }

  // Add Perk Tag
  const handleAddPerk = () => {
    const trimmed = newPerkInput.trim()
    if (!trimmed) return
    if (formPerks.includes(trimmed)) {
      toast.error("Perk tag already added.")
      return
    }
    setFormPerks((prev) => [...prev, trimmed])
    setNewPerkInput("")
  }

  // Remove Perk Tag
  const handleRemovePerk = (tag: string) => {
    setFormPerks((prev) => prev.filter((p) => p !== tag))
  }

  // Reset to default amenities directly
  const handleResetDefaults = async () => {
    if (!window.confirm("Reset amenities to the default 6 luxury signature showcases?")) {
      return
    }
    const defaultList: AmenityItem[] = [
      {
        id: "beach-club",
        title: "Private Beach Club",
        subtitle: "Pristine Sands & Daybeds",
        description: "Enjoy exclusive access to our secluded white sand cove, fully serviced with luxury loungers, double daybeds, and dedicated beachside concierges.",
        category: "beach",
        categoryLabel: "Beachfront",
        icon: "fa-umbrella-beach",
        hours: "6:00 AM – 7:00 PM",
        perks: ["Private Cove", "Double Daybeds", "Butler Service"],
        highlightBadge: "Signature",
      },
      {
        id: "water-sports",
        title: "Water Sports & Charters",
        subtitle: "Coastal Exploration",
        description: "Paddleboards, sea kayaks, and custom luxury yacht charters are available directly from the private resort pier for bespoke ocean exploration.",
        category: "beach",
        categoryLabel: "Sea Adventures",
        icon: "fa-ship",
        hours: "8:00 AM – 5:00 PM",
        perks: ["Private Yachts", "Sea Kayaks", "Guided Reef Tours"],
      },
      {
        id: "fine-dining",
        title: "Fine Oceanfront Dining",
        subtitle: "Mediterranean Gastronomy",
        description: "Indulge in gourmet Mediterranean cuisine crafted from locally sourced coastal ingredients, served directly over the water under the evening stars.",
        category: "dining",
        categoryLabel: "Gourmet Dining",
        icon: "fa-utensils",
        hours: "11:30 AM – 11:00 PM",
        perks: ["Michelin-Caliber Chefs", "Overwater Deck", "Private Cellar"],
        highlightBadge: "Award Winning",
      },
      {
        id: "poolside-loungers",
        title: "Poolside Loungers & Cabanas",
        subtitle: "Lagoon & Infinity Terraces",
        description: "Relax beside our multi-tiered heated lagoon and infinity pools, featuring shaded luxury cabanas, chilled towel service, and panoramic ocean vistas.",
        category: "wellness",
        categoryLabel: "Relaxation",
        icon: "fa-water",
        hours: "7:00 AM – 10:00 PM",
        perks: ["Infinity Edge", "Heated Waters", "Chilled Towels"],
      },
      {
        id: "wellness-spa",
        title: "Wellness & Spa Pavilion",
        subtitle: "Holistic Rejuvenation",
        description: "Experience world-class massage therapy, Himalayan salt saunas, and sensory wellness treatments designed to restore body and mind right on the shore.",
        category: "wellness",
        categoryLabel: "Holistic Health",
        icon: "fa-spa",
        hours: "9:00 AM – 9:00 PM",
        perks: ["Herbal Steam", "Deep Tissue Massage", "Sound Healing"],
        highlightBadge: "Holistic",
      },
      {
        id: "sunset-bar",
        title: "Sunset Cabana Bar",
        subtitle: "Artisanal Libations",
        description: "Sip custom botanical cocktails, fresh cold-pressed tropical juices, and vintage reserve wines served directly to your lounge chair by master mixologists.",
        category: "dining",
        categoryLabel: "Seaside Drinks",
        icon: "fa-martini-glass-citrus",
        hours: "3:00 PM – Midnight",
        perks: ["Master Mixology", "Craft Botanical Cocktails", "Sunset DJ Sets"],
      },
    ]
    await persistAmenities(defaultList, "Amenities reset to defaults and published to live site!")
  }

  // Filtered view
  const filteredAmenities = amenities.filter((item) => {
    const matchCategory = filterCategory === "all" || item.category === filterCategory
    const matchSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

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
            <Bone className="w-9 h-9 rounded-xl" />
            <div className="space-y-1.5">
              <Bone className="w-44 h-4 rounded-lg" />
              <Bone className="w-64 h-2.5 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Bone className="w-24 h-8 rounded-xl" />
            <Bone className="w-32 h-8 rounded-xl" />
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#131418] border border-black/10 dark:border-white/[0.08] rounded-2xl p-4 shadow-sm dark:shadow-lg space-y-2">
                <Bone className="w-24 h-3 rounded-lg" />
                <Bone className="w-16 h-7 rounded-lg" />
                <Bone className="w-32 h-2.5 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-[#131418] border border-black/10 dark:border-white/[0.08] rounded-2xl p-4 shadow-sm dark:shadow-lg flex items-center justify-between gap-4">
            <Bone className="w-64 h-10 rounded-xl" />
            <Bone className="w-36 h-10 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#131418] border border-black/10 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <Bone className="w-10 h-10 rounded-2xl" />
                  <Bone className="w-20 h-5 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Bone className="w-40 h-5 rounded-lg" />
                  <Bone className="w-full h-12 rounded-lg" />
                </div>
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <Bone className="w-28 h-4 rounded-lg" />
                  <Bone className="w-16 h-8 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0b0c10] text-[#1C1A17] dark:text-[#EAE5D9] font-sans pb-16">
      {/* ── Top Bar Header (Standardized) ── */}
      <header className="border-b border-luxury-gold/20 bg-[#FAF8F5]/90 dark:bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminSidebarToggle />
          <div className="w-9 h-9 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold shrink-0">
            <i className="fa-solid fa-concierge-bell text-sm"></i>
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-[#1C1A17] dark:text-white tracking-wide">
              Resort Amenities
            </h1>
            <p className="text-xs text-[#7A746B] dark:text-white/40">
              Manage showcase perks, experiences, operating hours, and categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#amenities"
            target="_blank"
            className="text-xs text-[#5C564F] dark:text-white/80 hover:text-luxury-gold border border-black/10 dark:border-white/10 hover:border-luxury-gold/50 bg-black/[0.03] dark:bg-white/5 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Live Site</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </Link>

          <AdminUserDropdown />
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#131418] border border-white/[0.08] rounded-2xl p-4 shadow-lg">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block font-semibold">Total Amenities</span>
            <span className="font-serif text-2xl font-bold text-white mt-1 block">{amenities.length}</span>
            <span className="text-[10px] text-luxury-gold mt-0.5 block">Configured for public view</span>
          </div>

          <div className="bg-[#131418] border border-white/[0.08] rounded-2xl p-4 shadow-lg">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block font-semibold">Active Categories</span>
            <span className="font-serif text-2xl font-bold text-white mt-1 block">
              {new Set(amenities.map((a) => a.category)).size}
            </span>
            <span className="text-[10px] text-white/40 mt-0.5 block">Beach, Wellness & Dining</span>
          </div>

          <div className="bg-[#131418] border border-white/[0.08] rounded-2xl p-4 shadow-lg">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block font-semibold">Signature Badges</span>
            <span className="font-serif text-2xl font-bold text-white mt-1 block">
              {amenities.filter((a) => a.highlightBadge).length}
            </span>
            <span className="text-[10px] text-amber-400 mt-0.5 block">Featured highlight tags</span>
          </div>

          <div className="bg-[#131418] border border-white/[0.08] rounded-2xl p-4 shadow-lg">
            <span className="text-[10px] text-white/40 uppercase tracking-wider block font-semibold">Cache & Egress</span>
            <span className="font-serif text-2xl font-bold text-emerald-400 mt-1 block">Edge Synced</span>
            <span className="text-[10px] text-white/40 mt-0.5 block">0 Supabase database egress</span>
          </div>
        </div>

        {/* ── Toolbar & Filters ── */}
        <div className="bg-[#131418] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            <button
              onClick={() => setFilterCategory("all")}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterCategory === "all"
                  ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/10"
                  : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              All ({amenities.length})
            </button>
            {CATEGORY_OPTIONS.map((cat) => {
              const count = amenities.filter((a) => a.category === cat.id).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === cat.id
                      ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/10"
                      : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-56">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs"></i>
              <input
                type="text"
                placeholder="Search amenities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#17181e] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={() => setPreviewMode(previewMode === "cards" ? "guest" : "cards")}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                previewMode === "guest"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white"
              }`}
              title="Toggle Live Guest Preview Simulator"
            >
              <i className={`fa-solid ${previewMode === "guest" ? "fa-table-cells-large" : "fa-eye"}`}></i>
              <span className="hidden sm:inline">{previewMode === "guest" ? "Card Editor" : "Live Preview"}</span>
            </button>

            <button
              onClick={handleAddNew}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-luxury-gold text-white font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-md shadow-luxury-gold/10 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>Add Amenity</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="text-xs p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all cursor-pointer"
              title="Reset to Default 6 Signature Amenities"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
          </div>
        </div>

        {/* ── Content View: Card Editor Mode ── */}
        {previewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAmenities.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-[#131418] border border-white/[0.08] rounded-2xl p-8">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-white/30 mx-auto mb-3">
                  <i className="fa-solid fa-concierge-bell text-xl"></i>
                </div>
                <h3 className="font-serif text-base text-white">No amenities found</h3>
                <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or filter category, or click &ldquo;Add Amenity&rdquo; to create a new showcase.
                </p>
                <button
                  onClick={handleAddNew}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-luxury-gold text-white text-xs font-semibold hover:opacity-90 transition-all"
                >
                  <i className="fa-solid fa-plus"></i>
                  Create First Amenity
                </button>
              </div>
            ) : (
              filteredAmenities.map((item, idx) => {
                const actualIndex = amenities.findIndex((a) => a.id === item.id)
                return (
                  <div
                    key={item.id}
                    className="group bg-[#131418] border border-white/[0.08] hover:border-luxury-gold/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200"
                  >
                    <div>
                      {/* Card Header: Icon, Badges, Category */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold text-lg group-hover:scale-105 transition-transform shrink-0">
                            <i className={`fa-solid ${item.icon}`}></i>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-luxury-gold tracking-widest block">
                              {item.categoryLabel}
                            </span>
                            <h3 className="font-serif text-base font-bold text-white group-hover:text-luxury-gold transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        {item.highlightBadge && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 shrink-0">
                            {item.highlightBadge}
                          </span>
                        )}
                      </div>

                      {/* Subtitle & Description */}
                      <p className="text-xs text-white/70 font-medium mb-1.5">{item.subtitle}</p>
                      <p className="text-xs text-white/50 leading-relaxed line-clamp-3 mb-4">
                        {item.description}
                      </p>

                      {/* Hours Tag */}
                      <div className="flex items-center gap-2 text-[11px] text-white/60 mb-3 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.05]">
                        <i className="fa-regular fa-clock text-luxury-gold text-xs"></i>
                        <span>{item.hours}</span>
                      </div>

                      {/* Perks Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {item.perks.map((perk, pIdx) => (
                          <span
                            key={pIdx}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/60"
                          >
                            &bull; {perk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      {/* Reorder Up/Down */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMove(actualIndex, "up")}
                          disabled={actualIndex === 0}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/10 disabled:opacity-20 text-white/70 flex items-center justify-center text-xs transition-colors cursor-pointer"
                          title="Move up"
                        >
                          <i className="fa-solid fa-arrow-up"></i>
                        </button>
                        <button
                          onClick={() => handleMove(actualIndex, "down")}
                          disabled={actualIndex === amenities.length - 1}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/10 disabled:opacity-20 text-white/70 flex items-center justify-center text-xs transition-colors cursor-pointer"
                          title="Move down"
                        >
                          <i className="fa-solid fa-arrow-down"></i>
                        </button>
                      </div>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-luxury-gold/20 hover:text-luxury-gold border border-white/10 text-xs font-medium text-white/80 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="w-7 h-7 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xs transition-all cursor-pointer"
                          title="Delete Amenity"
                        >
                          <i className="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Content View: Live Guest Preview Mode (Light Luxury Theme) ── */}
        {previewMode === "guest" && (
          <div className="bg-[#FAF8F5] text-[#1C1A17] rounded-3xl p-6 md:p-10 border border-luxury-gold/30 shadow-2xl space-y-8">
            <div className="flex items-center justify-between border-b border-[#1C1A17]/10 pb-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-[#D4AF37]">
                  Guest Simulator Preview (Light Luxury Theme)
                </span>
                <h2 className="font-serif text-xl font-bold text-[#1C1A17]">
                  What Guests See on the Public Landing Page
                </h2>
              </div>
              <button
                onClick={() => setPreviewMode("cards")}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-[#1C1A17] text-white font-medium hover:bg-black transition-all cursor-pointer"
              >
                Back to Card Editor
              </button>
            </div>

            {/* Live Rendered Card Grid in Public Theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAmenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="bg-white rounded-2xl p-6 border border-[#1C1A17]/10 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-amber-200/60 flex items-center justify-center text-[#D4AF37] text-xl shadow-inner">
                        <i className={`fa-solid ${amenity.icon}`}></i>
                      </div>
                      {amenity.highlightBadge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                          {amenity.highlightBadge}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D4AF37] block mb-1">
                      {amenity.categoryLabel}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#1C1A17] mb-1">
                      {amenity.title}
                    </h3>
                    <p className="text-xs font-medium text-[#1C1A17]/70 mb-3">{amenity.subtitle}</p>
                    <p className="text-xs text-[#1C1A17]/65 leading-relaxed mb-4">
                      {amenity.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-[#1C1A17]/60 mb-4 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#1C1A17]/5">
                      <i className="fa-regular fa-clock text-[#D4AF37]"></i>
                      <span>{amenity.hours}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {amenity.perks.map((perk, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#1C1A17]/10 text-[#1C1A17]/75 font-medium"
                        >
                          &bull; {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Modal: Add / Edit Amenity ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131418] border border-white/[0.12] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold/15 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold">
                  <i className={`fa-solid ${formIcon}`}></i>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {editingItem ? "Edit Amenity" : "Create New Amenity"}
                  </h3>
                  <p className="text-xs text-white/40">
                    Configure public card titles, icon, perks, and schedule.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-white/70 block mb-1">
                    Amenity Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Private Beach Club"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#17181e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/70 block mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pristine Sands & Daybeds"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#17181e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              {/* Category, Label & Highlight Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-white/70 block mb-1">
                    Category Filter
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value)
                      if (e.target.value === "beach") setFormCategoryLabel("Beachfront")
                      if (e.target.value === "wellness") setFormCategoryLabel("Holistic Health")
                      if (e.target.value === "dining") setFormCategoryLabel("Gourmet Dining")
                    }}
                    className="w-full px-3 py-2 bg-[#17181e] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-luxury-gold"
                  >
                    <option value="beach">Beach & Ocean</option>
                    <option value="wellness">Wellness & Spa</option>
                    <option value="dining">Dining & Bar</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/70 block mb-1">
                    Category Pill Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Beachfront"
                    value={formCategoryLabel}
                    onChange={(e) => setFormCategoryLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#17181e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/70 block mb-1">
                    Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Signature, Award Winning"
                    value={formHighlightBadge}
                    onChange={(e) => setFormHighlightBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-[#17181e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Operating Hours / Schedule
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6:00 AM – 7:00 PM or 24/7 Butler Service"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  className="w-full px-3 py-2 bg-[#17181e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe this luxury experience for prospective guests..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#17181e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold leading-relaxed"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1.5">
                  Select Icon ({AVAILABLE_ICONS.find((i) => i.icon === formIcon)?.label || formIcon})
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-32 overflow-y-auto p-2 bg-[#17181e] border border-white/10 rounded-xl">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.icon}
                      type="button"
                      onClick={() => setFormIcon(item.icon)}
                      className={`h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        formIcon === item.icon
                          ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20 scale-105"
                          : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
                      }`}
                      title={item.label}
                    >
                      <i className={`fa-solid ${item.icon} text-sm`}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Included Perks Tags */}
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Included Perks & Features
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Chilled Towels, Butler Service"
                    value={newPerkInput}
                    onChange={(e) => setNewPerkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddPerk()
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-[#17181e] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-luxury-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddPerk}
                    className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/12 border border-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    + Add Perk
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#17181e]/60 rounded-xl border border-white/[0.05]">
                  {formPerks.length === 0 ? (
                    <span className="text-[10px] text-white/30 italic">No perks added yet.</span>
                  ) : (
                    formPerks.map((perk, pIdx) => (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold font-medium"
                      >
                        {perk}
                        <button
                          type="button"
                          onClick={() => handleRemovePerk(perk)}
                          className="hover:text-white text-xs leading-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-luxury-gold text-white font-semibold text-xs tracking-wider uppercase hover:opacity-90 transition-all shadow-md shadow-luxury-gold/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                      <span>{editingItem ? "Updating..." : "Saving..."}</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Update Amenity" : "Add to Catalog"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
