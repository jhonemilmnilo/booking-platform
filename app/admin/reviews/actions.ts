"use server"

import prisma from "@/lib/prisma/client"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js"

export async function getApprovedReviewsAction() {
  try {
    return await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
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
    })
    return { success: true }
  } catch (error) {
    console.error("[ReviewsAction] Failed to approve review:", error)
    return { success: false, error: "Failed to approve review." }
  }
}

export async function deleteReviewAction(id: string) {
  try {
    const review = await prisma.review.findUnique({ where: { id } })
    if (review && review.videoUrl) {
      try {
        const supabase = await createClient()
        const urlParts = review.videoUrl.split("/system-settings/")
        const filePath = urlParts[1]
        if (filePath) {
          await supabase.storage.from("system-settings").remove([filePath])
        }
      } catch (e) {
        console.error("[ReviewsAction] Failed to remove asset from storage:", e)
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

    const rating = parseInt(ratingVal) || 5

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

      const fileExt = file.name.split(".").pop()
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
        stayDate,
        comment,
        videoUrl,
        isApproved: false,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("[ReviewsAction] Failed to submit guest story:", error)
    return { success: false, error: error instanceof Error ? error.message : "Submission failed." }
  }
}
