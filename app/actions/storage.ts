"use server"

import { createClient } from "@/lib/supabase/server"

export interface UploadResponse {
  success: boolean
  url?: string
  error?: string
}

export async function uploadImageAction(formData: FormData): Promise<UploadResponse> {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Validate file type (Images only)
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" }
    }

    // Validate file size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return { success: false, error: "File size exceeds 5MB limit" }
    }

    const supabase = await createClient()
    
    // Unique filename generator
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `resort/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage Bucket 'gallery'
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` }
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("gallery")
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during upload"
    return {
      success: false,
      error: errorMessage,
    }
  }
}
