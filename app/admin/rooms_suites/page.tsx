"use client"

import * as React from "react"
import Image from "next/image"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  getRoomsAction,
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
} from "./action"

interface Room {
  id: string
  name: string
  description: string
  pricePerNight: number
  capacity: number
  imageUrl: string
  size: string
  amenities: string[]
  images: string[]
}

const PRESET_AMENITIES = [
  "Private Swim-up Pool",
  "Beachfront Daybeds",
  "Personal Concierge",
  "Outdoor Spa Deck",
  "Beachfront Deck",
  "Outdoor Sand Firepit",
  "Deep-Immersion Tub",
  "Speedboat Charters",
  "Lagoon Swim Access",
  "Tropical Garden Room",
  "Reef Snorkeling Kit",
  "Private Yoga Coach",
]

export default function AdminRoomsPage() {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null)

  // Form states
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [pricePerNight, setPricePerNight] = React.useState<number>(10000)
  const [capacity, setCapacity] = React.useState<number>(2)
  const [imageUrl, setImageUrl] = React.useState("/images/image1.png")
  const [size, setSize] = React.useState("5,000 Sq Ft")
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([])
  const [customAmenity, setCustomAmenity] = React.useState("")
  const [galleryImages, setGalleryImages] = React.useState<string[]>([""])
  const [previewMode, setPreviewMode] = React.useState<"showcase" | "card">("showcase")
  const handleFileUpload = async (
    file: File,
    onUploadSuccess: (url: string) => void,
    onUploadProgress?: () => void,
    onUploadError?: () => void
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.")
      if (onUploadError) onUploadError()
      return
    }

    if (onUploadProgress) onUploadProgress()
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `room-images/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from("rooms")
        .upload(filePath, file)

      if (uploadError) {
        console.error("[Storage] Upload failed:", uploadError)
        throw new Error(uploadError.message)
      }

      const { data } = supabase.storage.from("rooms").getPublicUrl(filePath)
      onUploadSuccess(data.publicUrl)
      toast.success("Image uploaded successfully!")
    } catch (err) {
      console.error("[Storage] Error uploading file:", err)
      const message = err instanceof Error ? err.message : "Please make sure 'rooms' bucket exists."
      toast.error(`Upload failed: ${message}`)
      if (onUploadError) onUploadError()
    }
  }


  const loadRooms = React.useCallback(() => {
    getRoomsAction()
      .then((res) => {
        if (res.success && res.data) {
          setRooms(res.data as Room[])
        } else {
          toast.error(res.error || "Failed to fetch rooms.")
        }
      })
      .catch((err) => {
        console.error("[AdminRooms] Error loading rooms:", err)
        toast.error("An error occurred while retrieving rooms.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  React.useEffect(() => {
    loadRooms()
  }, [loadRooms])

  // Open modal for creating new room
  const handleOpenCreateModal = () => {
    setEditingRoom(null)
    setName("")
    setDescription("")
    setPricePerNight(10000)
    setCapacity(2)
    setImageUrl("/images/image1.png")
    setSize("5,000 Sq Ft")
    setSelectedAmenities([])
    setCustomAmenity("")
    setGalleryImages([""])
    setIsModalOpen(true)
  }

  // Open modal for editing existing room
  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room)
    setName(room.name)
    setDescription(room.description)
    setPricePerNight(room.pricePerNight)
    setCapacity(room.capacity)
    setImageUrl(room.imageUrl)
    setSize(room.size)
    setSelectedAmenities(room.amenities)
    setCustomAmenity("")
    setGalleryImages(room.images.length > 0 ? [...room.images] : [""])
    setIsModalOpen(true)
  }

  // Toggle preset amenity
  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity))
    } else {
      setSelectedAmenities([...selectedAmenities, amenity])
    }
  }

  // Add custom amenity tag
  const handleAddCustomAmenity = () => {
    if (!customAmenity.trim()) return
    const cleaned = customAmenity.trim()
    if (!selectedAmenities.includes(cleaned)) {
      setSelectedAmenities([...selectedAmenities, cleaned])
    }
    setCustomAmenity("")
  }

  // Add field in gallery image array
  const handleAddGalleryImageField = () => {
    setGalleryImages([...galleryImages, ""])
  }

  // Edit value in gallery image array
  const handleUpdateGalleryImage = (index: number, val: string) => {
    const next = [...galleryImages]
    next[index] = val
    setGalleryImages(next)
  }

  // Remove field in gallery image array
  const handleRemoveGalleryImageField = (index: number) => {
    const next = galleryImages.filter((_, i) => i !== index)
    setGalleryImages(next.length === 0 ? [""] : next)
  }

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Filter out empty custom gallery image inputs
    const finalGallery = galleryImages.map((img) => img.trim()).filter((img) => img !== "")

    const payload = {
      name: name.trim(),
      description: description.trim(),
      pricePerNight,
      capacity,
      imageUrl: imageUrl.trim(),
      size: size.trim(),
      amenities: selectedAmenities,
      images: finalGallery,
    }

    try {
      let res
      if (editingRoom) {
        res = await updateRoomAction(editingRoom.id, payload)
      } else {
        res = await createRoomAction(payload)
      }

      if (res.success) {
        toast.success(editingRoom ? "Suite successfully updated!" : "New suite successfully created!")
        setIsModalOpen(false)
        loadRooms()
      } else {
        toast.error(res.error || "Failed to save room details.")
      }
    } catch (err) {
      console.error("[AdminRooms] Save error:", err)
      toast.error("An error occurred while saving room.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Delete Room
  const handleDeleteRoom = async (id: string, roomName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete the suite "${roomName}"?`)
    if (!confirmDelete) return

    try {
      const res = await deleteRoomAction(id)
      if (res.success) {
        toast.success("Suite successfully deleted.")
        loadRooms()
      } else {
        toast.error(res.error || "Failed to delete suite.")
      }
    } catch (err) {
      console.error("[AdminRooms] Delete error:", err)
      toast.error("An error occurred during deletion.")
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#EAE5D9] font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-[#D4AF37]/20 bg-[#0b0c10]/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-hotel text-[#D4AF37] text-xl"></i>
          <div>
            <h1 className="font-serif text-lg tracking-wider text-white">Suites & Villas Directory</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Resort Lodging Assets</p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-bold text-xs uppercase tracking-[0.15em] px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
        >
          <i className="fa-solid fa-plus mr-1.5"></i> Add Suite / Villa
        </button>
      </header>

      {/* Main Content Area */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/50">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-[#D4AF37]"></i>
            <span className="text-xs uppercase tracking-widest font-semibold">Loading Suite Portfolio...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="border border-[#D4AF37]/10 bg-white/5 rounded-3xl p-16 text-center max-w-lg mx-auto mt-12">
            <i className="fa-solid fa-hotel text-5xl text-[#D4AF37]/35 mb-4 block"></i>
            <h3 className="font-serif text-xl text-white font-semibold mb-2">No Suites Found</h3>
            <p className="text-xs text-white/50 mb-6">Create your first database-backed resort suite or villa asset to populate the frontend carousel.</p>
            <button
              onClick={handleOpenCreateModal}
              className="bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-bold text-xs uppercase tracking-[0.15em] px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Add First Suite
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-[#111216] border border-[#D4AF37]/15 rounded-3xl overflow-hidden hover:border-[#D4AF37]/45 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full bg-black/40 overflow-hidden">
                  <Image
                    src={room.imageUrl}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[10px] text-[#D4AF37] tracking-wider uppercase font-bold block">{room.size}</span>
                      <h3 className="font-serif text-base text-white font-bold truncate max-w-[240px]">{room.name}</h3>
                    </div>
                  </div>

                  {/* Badges / Images Count */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-black/85 border border-[#D4AF37]/30 px-2 py-0.5 rounded text-[8px] tracking-widest uppercase font-bold text-white flex items-center gap-1 shadow-md">
                      <i className="fa-regular fa-images text-[#D4AF37]"></i> {(room.images?.length || 0) + 1} Photos
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-white/60 text-xs leading-relaxed line-clamp-3">{room.description}</p>

                  <div className="space-y-2">
                    <span className="text-[9px] text-[#D4AF37]/75 font-semibold uppercase tracking-wider block">Specs & Pricing</span>
                    <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                      <div>
                        <span className="text-[9px] text-white/40 block uppercase">Rate / Night</span>
                        <span className="font-serif text-[#D4AF37] text-sm font-bold">₱{room.pricePerNight.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-white/40 block uppercase">Max Guests</span>
                        <span className="text-xs text-white font-semibold">{room.capacity} VIPs</span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-[#D4AF37]/75 font-semibold uppercase tracking-wider block">Key Amenities</span>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 4).map((a, idx) => (
                        <span
                          key={idx}
                          className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-2 py-0.5 rounded text-[9px] text-white/80"
                        >
                          {a}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] text-white/40">
                          +{room.amenities.length - 4} More
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Actions Bar */}
                <div className="border-t border-[#D4AF37]/10 bg-white/5 p-4 flex justify-between gap-3">
                  <button
                    onClick={() => handleOpenEditModal(room)}
                    className="flex-1 bg-white/5 hover:bg-[#D4AF37]/15 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white/85 text-xs py-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-pencil text-[10px]"></i> Edit Details
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id, room.name)}
                    className="bg-[#ff4a4a]/5 hover:bg-[#ff4a4a]/15 border border-[#ff4a4a]/25 text-[#ff4a4a] hover:text-[#ff3838] p-2 w-10 h-10 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center shadow-sm"
                    aria-label="Delete Suite"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Centered Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-fade-in">
          {/* Clickable backdrop overlay to close */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-6xl bg-[#111216] border border-[#D4AF37]/25 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto z-10 flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#D4AF37]/15 pb-4 mb-6">
              <div>
                <h2 className="font-serif text-lg text-white font-bold">
                  {editingRoom ? `Edit "${editingRoom.name}"` : "Create New Suite / Villa"}
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-0.5">
                  {editingRoom ? "Update assets database record" : "Configure new property details"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Editor */}
              <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                
                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Suite / Villa Title</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. The Beachfront Royal Suite"
                      className="w-full bg-black/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>

                  {/* Size and Capacity Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Villa Size</label>
                      <input
                        type="text"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        required
                        placeholder="e.g. 6,800 Sq Ft"
                        className="w-full bg-black/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Max Guests Capacity</label>
                      <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                        required
                        min={1}
                        className="w-full bg-black/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                  </div>

                  {/* Price and Primary Image Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Price Per Night (₱)</label>
                      <input
                        type="number"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(parseInt(e.target.value) || 0)}
                        required
                        min={0}
                        className="w-full bg-black/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Primary Cover Image</label>
                      <div className="flex gap-3 items-center">
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-black/45 border border-[#D4AF37]/25 flex-shrink-0 flex items-center justify-center">
                          {imageUrl === "UPLOADING" ? (
                            <i className="fa-solid fa-spinner fa-spin text-white/50 text-xs"></i>
                          ) : imageUrl.trim() ? (
                            <Image
                              src={imageUrl}
                              alt="Cover Preview"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <i className="fa-regular fa-image text-white/20 text-xs"></i>
                          )}
                        </div>

                        <div className="flex-1 flex gap-2">
                          <label className="flex-1 flex items-center justify-center bg-black/40 hover:bg-black/60 border border-[#D4AF37]/25 hover:border-[#D4AF37] rounded-xl px-4 py-2 text-xs text-[#D4AF37] font-semibold cursor-pointer transition-all duration-300">
                            <i className="fa-solid fa-cloud-arrow-up mr-2"></i> {imageUrl && imageUrl !== "UPLOADING" ? "Change Image" : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={imageUrl === "UPLOADING"}
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const prev = imageUrl
                                  await handleFileUpload(
                                    file,
                                    (url) => setImageUrl(url),
                                    () => setImageUrl("UPLOADING"),
                                    () => setImageUrl(prev)
                                  )
                                }
                              }}
                            />
                          </label>
                          {imageUrl && imageUrl !== "UPLOADING" && (
                            <button
                              type="button"
                              onClick={() => setImageUrl("")}
                              className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-xs hover:text-[#ff4a4a] hover:bg-[#ff4a4a]/10 cursor-pointer transition-all"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Suite Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={3}
                      placeholder="Enter a detailed description of the villa specifications, layout, views, and unique highlights..."
                      className="w-full bg-black/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] resize-none transition-all"
                    />
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Amenities (Select or Add)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-black/20 border border-white/5 rounded-xl p-2.5">
                      {PRESET_AMENITIES.map((a) => {
                        const isChecked = selectedAmenities.includes(a)
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => handleToggleAmenity(a)}
                            className={`text-[9px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                              isChecked
                                ? "bg-[#D4AF37] text-[#1c1a17] font-bold"
                                : "bg-white/5 text-white/60 hover:text-white"
                            }`}
                          >
                            {a}
                          </button>
                        )
                      })}
                    </div>

                    {/* Add Custom Amenity Tag */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        placeholder="Or type a custom amenity..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAmenity}
                        className="bg-white/10 hover:bg-[#D4AF37] hover:text-[#1c1a17] text-white text-xs px-3 rounded-xl transition-all cursor-pointer font-semibold"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider block">Gallery Images (Extra Assets)</label>
                    <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto bg-black/20 border border-white/5 rounded-xl p-3">
                      {galleryImages.map((img, i) => (
                        <div key={i} className="relative group w-24 h-16 rounded-xl overflow-hidden bg-black/45 border border-white/10 flex-shrink-0 flex items-center justify-center">
                          {img === "UPLOADING" ? (
                            <div className="flex flex-col items-center justify-center">
                              <i className="fa-solid fa-spinner fa-spin text-white/50 text-xs mb-1"></i>
                              <span className="text-[7px] text-white/40 uppercase tracking-wider font-semibold">Uploading</span>
                            </div>
                          ) : img.trim() ? (
                            <>
                              <Image
                                src={img}
                                alt="Preview"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              {/* Hover delete overlay */}
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImageField(i)}
                                  className="w-7 h-7 rounded-full bg-[#ff4a4a] hover:bg-[#ff3838] text-white flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md"
                                  title="Remove Image"
                                >
                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full p-1.5 flex flex-col justify-between items-center bg-black/20">
                              <label className="flex-1 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 rounded-lg border border-dashed border-white/10 transition-colors">
                                <i className="fa-solid fa-cloud-arrow-up text-[#D4AF37] text-[10px] mb-0.5"></i>
                                <span className="text-[7px] text-white/50 uppercase tracking-widest font-semibold">Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      await handleFileUpload(
                                        file,
                                        (url) => handleUpdateGalleryImage(i, url),
                                        () => handleUpdateGalleryImage(i, "UPLOADING"),
                                        () => handleRemoveGalleryImageField(i)
                                      )
                                    }
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImageField(i)}
                                className="text-[#ff4a4a]/85 hover:text-[#ff3838] text-[7px] font-bold tracking-wider uppercase mt-1"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddGalleryImageField}
                      className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i> Add Extra Image Field
                    </button>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="border-t border-[#D4AF37]/15 pt-6 mt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-gold-gradient hover:brightness-110 text-luxury-obsidian font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSaving && <i className="fa-solid fa-spinner fa-spin"></i>}
                    {editingRoom ? "Save Changes" : "Create Suite"}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Preview Panel */}
              <div className="lg:col-span-5 border border-[#D4AF37]/15 bg-black/30 rounded-2xl p-5 space-y-5 lg:sticky lg:top-4">
                <div className="flex justify-between items-center border-b border-[#D4AF37]/10 pb-3">
                  <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Live Preview
                  </span>
                  <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("showcase")}
                      className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                        previewMode === "showcase"
                          ? "bg-[#D4AF37] text-[#1c1a17]"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      Showcase
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("card")}
                      className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                        previewMode === "card"
                          ? "bg-[#D4AF37] text-[#1c1a17]"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      Card
                    </button>
                  </div>
                </div>

                {/* Preview Frame */}
                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/5">
                  {previewMode === "showcase" ? (
                    /* Showcase Preview */
                    <div className="bg-[#1c1a17] text-[#EAE5D9] p-6 border border-[#D4AF37]/20 rounded-xl relative overflow-hidden space-y-4">
                      {/* Cover Photo */}
                      <div className="relative h-40 w-full rounded-lg overflow-hidden bg-black/45">
                        {imageUrl && imageUrl !== "UPLOADING" ? (
                          <Image src={imageUrl} alt={name || "Suite Preview"} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <i className="fa-regular fa-image text-3xl"></i>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/85 border border-[#D4AF37]/30 px-2 py-0.5 rounded text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest">
                          ₱{pricePerNight.toLocaleString()} / Night
                        </div>
                      </div>

                      {/* Header details */}
                      <div className="space-y-1">
                        <span className="text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-[9px] block">
                          {size || "Villa Size"}
                        </span>
                        <h3 className="font-serif text-xl text-white font-bold tracking-wide truncate">
                          {name || "Suite Name"}
                        </h3>
                        <p className="text-[10px] text-white/50 font-sans tracking-wide uppercase font-semibold">
                          Max Guests: {capacity} VIPs
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-white/60 text-xs leading-relaxed line-clamp-3 min-h-[4.5em]">
                        {description || "Suite description goes here..."}
                      </p>

                      {/* Amenities */}
                      <div className="space-y-1.5 pt-2 border-t border-[#D4AF37]/10">
                        <span className="text-[#D4AF37] font-semibold uppercase text-[9px] tracking-wider block">Key Amenities</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedAmenities.length > 0 ? (
                            selectedAmenities.slice(0, 4).map((a, idx) => (
                              <span key={idx} className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-2 py-0.5 rounded text-[8px] text-white/80">
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-[8px] text-white/30 italic">No amenities selected</span>
                          )}
                          {selectedAmenities.length > 4 && (
                            <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] text-white/40">
                              +{selectedAmenities.length - 4} More
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <div className="w-full text-center bg-gold-gradient text-luxury-obsidian font-bold text-[10px] uppercase tracking-widest py-2.5 rounded-lg select-none">
                          Configure Itinerary
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Card Preview */
                    <div className="bg-[#16171b] border border-white/5 rounded-xl overflow-hidden flex flex-col justify-between space-y-4 p-0">
                      {/* Image Frame */}
                      <div className="relative h-44 w-full bg-black/40 overflow-hidden">
                        {imageUrl && imageUrl !== "UPLOADING" ? (
                          <Image src={imageUrl} alt={name || "Suite Preview"} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/25">
                            <i className="fa-regular fa-image text-3xl"></i>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/85 border border-[#D4AF37]/30 px-2 py-0.5 rounded text-[8px] tracking-widest uppercase font-bold text-white">
                          ₱{pricePerNight.toLocaleString()} / night
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="px-5 pb-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-white tracking-tight truncate">
                            {name || "Suite Name"}
                          </h3>
                          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed min-h-[3em]">
                            {description || "Suite description goes here..."}
                          </p>

                          {/* Info Specs */}
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-white/40">
                            <span className="flex items-center gap-1">
                              <i className="fa-solid fa-users text-[#D4AF37] text-[9px]"></i>
                              Up to {capacity} Guests
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="fa-solid fa-expand text-[#D4AF37] text-[9px]"></i>
                              {size || "Villa Size"}
                            </span>
                          </div>

                          {/* Amenities Badges */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {selectedAmenities.length > 0 ? (
                              selectedAmenities.slice(0, 3).map((a) => (
                                <span key={a} className="inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                  <i className="fa-solid fa-circle-check text-emerald-500 text-[7px]"></i>
                                  {a}
                                </span>
                              ))
                            ) : (
                              <span className="text-[8px] text-white/30 italic">No amenities selected</span>
                            )}
                          </div>
                        </div>

                        {/* Request booking button */}
                        <div className="w-full bg-white/10 text-white font-semibold text-center py-2.5 rounded-lg text-xs hover:bg-white/20 select-none">
                          Request Booking
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Guidance text */}
                <p className="text-[9px] text-white/30 leading-normal italic text-center">
                  * Live preview shows real-time changes to text, pricing, cover image, and amenities configurations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
