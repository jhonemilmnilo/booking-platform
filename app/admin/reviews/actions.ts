"use server"

import prisma from "@/lib/prisma/client"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js"

export async function getApprovedReviewsAction() {
  try {
    return await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        guestName: true,
        rating: true,
        stayDate: true,
        comment: true,
        videoUrl: true,
        imageUrl: true,
        isApproved: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error("[ReviewsAction] Failed to fetch approved reviews:", error)
    throw new Error("Failed to fetch approved reviews.")
  }
}

export async function getPendingReviewsAction() {
  try {
    return await prisma.review.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        guestName: true,
        rating: true,
        stayDate: true,
        comment: true,
        videoUrl: true,
        imageUrl: true,
        isApproved: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error("[ReviewsAction] Failed to fetch pending reviews:", error)
    throw new Error("Failed to fetch pending reviews.")
  }
}

export async function approveReviewAction(id: string) {
  try {
    await prisma.review.update({
      where: { id },
      data: { isApproved: true },
      select: { id: true },
    })
    return { success: true }
  } catch (error) {
    console.error("[ReviewsAction] Failed to approve review:", error)
    return { success: false, error: "Failed to approve review." }
  }
}

export async function toggleReviewApprovalAction(id: string, isApproved: boolean) {
  try {
    await prisma.review.update({
      where: { id },
      data: { isApproved },
      select: { id: true },
    })
    return { success: true }
  } catch (error) {
    console.error("[ReviewsAction] Failed to toggle review approval:", error)
    return { success: false, error: "Failed to update review approval status." }
  }
}

export async function deleteReviewAction(id: string) {
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        videoUrl: true,
        imageUrl: true,
      },
    })

    if (review) {
      const mediaUrls = [review.videoUrl, review.imageUrl].filter(Boolean) as string[]
      for (const url of mediaUrls) {
        if (url.includes("/system-settings/")) {
          try {
            const supabase = await createClient()
            const filePath = url.split("/system-settings/")[1]
            if (filePath) {
              await supabase.storage.from("system-settings").remove([filePath])
            }
          } catch (storageErr) {
            console.error("[ReviewsAction] Failed to remove asset from storage:", storageErr)
          }
        }
      }
    }

    await prisma.review.delete({
      where: { id },
    })
    return { success: true }
  } catch (error) {
    console.error("[ReviewsAction] Failed to delete review:", error)
    return { success: false, error: "Failed to delete review." }
  }
}

export async function submitReviewAction(formData: FormData) {
  try {
    const guestName = formData.get("guestName") as string
    const ratingVal = formData.get("rating") as string
    const stayDate = formData.get("stayDate") as string
    const comment = formData.get("comment") as string
    const file = formData.get("file") as File | null

    if (!guestName || !comment) {
      return { success: false, error: "Guest name and comment are required." }
    }

    const rating = Math.min(5, Math.max(1, parseInt(ratingVal) || 5))

    let videoUrl: string | null = null

    if (file && file.size > 0) {
      // 1. Validate File Size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024
      if (file.size > MAX_SIZE) {
        return { success: false, error: "Video file exceeds the 5MB limit." }
      }

      // 2. Validate Type (video format only)
      if (!file.type.startsWith("video/")) {
        return { success: false, error: "Only video files are allowed for guest reels." }
      }

      const supabase = createSupabaseServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const fileExt = file.name.split(".").pop() || "mp4"
      const fileName = `diary_reel_${Date.now()}.${fileExt}`
      const filePath = `diaries/${fileName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from("system-settings")
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from("system-settings")
        .getPublicUrl(filePath)

      videoUrl = publicUrl
    }

    await prisma.review.create({
      data: {
        guestName,
        rating,
        stayDate: stayDate || null,
        comment,
        videoUrl,
        isApproved: false,
      },
      select: {
        id: true,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("[ReviewsAction] Failed to submit guest story:", error)
    return { success: false, error: error instanceof Error ? error.message : "Submission failed." }
  }
}

export async function createAdminReviewAction(formData: FormData) {
  try {
    const guestName = formData.get("guestName") as string
    const ratingVal = formData.get("rating") as string
    const stayDate = formData.get("stayDate") as string
    const comment = formData.get("comment") as string
    const isApprovedVal = formData.get("isApproved") as string
    const manualVideoUrl = (formData.get("videoUrl") as string)?.trim() || null
    const manualImageUrl = (formData.get("imageUrl") as string)?.trim() || null
    const file = formData.get("file") as File | null

    if (!guestName || !comment) {
      return { success: false, error: "Guest name and comment are required." }
    }

    const rating = Math.min(5, Math.max(1, parseInt(ratingVal) || 5))
    const isApproved = isApprovedVal === "true" || isApprovedVal === "1"

    let videoUrl = manualVideoUrl
    let imageUrl = manualImageUrl

    if (file && file.size > 0) {
      const MAX_SIZE = 5 * 1024 * 1024
      if (file.size > MAX_SIZE) {
        return { success: false, error: "File exceeds the 5MB limit." }
      }

      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")

      if (!isVideo && !isImage) {
        return { success: false, error: "Only image or video files are allowed." }
      }

      const supabase = createSupabaseServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const fileExt = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")
      const folder = isVideo ? "diaries" : "reviews"
      const fileName = `admin_${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from("system-settings")
        .upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from("system-settings")
        .getPublicUrl(filePath)

      if (isVideo) {
        videoUrl = publicUrl
      } else {
        imageUrl = publicUrl
      }
    }

    const review = await prisma.review.create({
      data: {
        guestName,
        rating,
        stayDate: stayDate || null,
        comment,
        videoUrl,
        imageUrl,
        isApproved,
      },
      select: {
        id: true,
        guestName: true,
        rating: true,
        stayDate: true,
        comment: true,
        videoUrl: true,
        imageUrl: true,
        isApproved: true,
        createdAt: true,
      },
    })

    return { success: true, data: review }
  } catch (error) {
    console.error("[ReviewsAction] Failed to create admin review:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create review." }
  }
}
