"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import prisma from "@/lib/prisma/client"

const roomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pricePerNight: z.number().min(0, "Price must be non-negative"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  imageUrl: z.string().min(1, "Primary image URL is required"),
  size: z.string().min(1, "Size is required"),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
})

export async function getRoomsAction() {
  try {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        pricePerNight: true,
        capacity: true,
        imageUrl: true,
        size: true,
        amenities: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: rooms }
  } catch (error) {
    console.error("[RoomsAction] Failed to retrieve rooms:", error)
    return { success: false, error: "Failed to retrieve rooms." }
  }
}

export async function createRoomAction(data: unknown) {
  try {
    const parsed = roomSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const room = await prisma.room.create({
      data: parsed.data,
      select: { id: true, name: true }
    })
    revalidatePath("/")
    revalidatePath("/admin/rooms_suites")
    return { success: true, data: room }
  } catch (error) {
    console.error("[RoomsAction] Failed to create room:", error)
    return { success: false, error: "Failed to create room." }
  }
}

export async function updateRoomAction(id: string, data: unknown) {
  try {
    const parsed = roomSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }
    const room = await prisma.room.update({
      where: { id },
      data: parsed.data,
      select: { id: true, name: true }
    })
    revalidatePath("/")
    revalidatePath("/admin/rooms_suites")
    return { success: true, data: room }
  } catch (error) {
    console.error("[RoomsAction] Failed to update room:", error)
    return { success: false, error: "Failed to update room." }
  }
}

export async function deleteRoomAction(id: string) {
  try {
    await prisma.room.delete({
      where: { id },
    })
    revalidatePath("/")
    revalidatePath("/admin/rooms_suites")
    return { success: true }
  } catch (error) {
    console.error("[RoomsAction] Failed to delete room:", error)
    return { success: false, error: "Failed to delete room." }
  }
}
