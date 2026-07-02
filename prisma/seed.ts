import { createClient } from "@supabase/supabase-js"
import prisma from "../lib/prisma/client"
import * as dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminEmail = "nilojhonemil1@gmail.com"
const adminPassword = "AdminPassword123!"

async function main() {
  console.log("[Seed] Starting database seeding...")
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[Seed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })



  try {
    // 1. Manage Supabase Auth user
    console.log(`[Seed] Checking if auth user exists in Supabase: ${adminEmail}`)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw new Error(`Failed to list users from Supabase: ${listError.message}`)
    }

    let supabaseUser = users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase())

    if (!supabaseUser) {
      console.log(`[Seed] Auth user does not exist. Creating admin auth user...`)
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          full_name: "Admin User",
        },
      })

      if (createError) {
        throw new Error(`Failed to create admin in Supabase: ${createError.message}`)
      }

      supabaseUser = createData.user
      console.log(`[Seed] Admin auth user successfully created with ID: ${supabaseUser.id}`)
    } else {
      console.log(`[Seed] Admin auth user already exists in Supabase with ID: ${supabaseUser.id}`)
    }

    // 2. Sync to Prisma User database
    console.log(`[Seed] Syncing admin user to Prisma database...`)

    const existingDbUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingDbUser && existingDbUser.id !== supabaseUser.id) {
      console.log(`[Seed] Found database user record with matching email but different ID (${existingDbUser.id}). Deleting to sync with correct Supabase ID...`)
      await prisma.user.delete({
        where: { id: existingDbUser.id }
      })
    }

    const userRecord = await prisma.user.upsert({
      where: { id: supabaseUser.id },
      update: {
        role: "ADMIN",
        email: adminEmail,
        fullName: "Admin User",
      },
      create: {
        id: supabaseUser.id,
        email: adminEmail,
        fullName: "Admin User",
        role: "ADMIN",
      },
    })
    console.log(`[Seed] User sync complete:`, userRecord)

    // 3. Seed Default System Settings
    console.log(`[Seed] Initializing default system settings...`)
    const defaultSettings = [
      { key: "hero_subtitle", value: "The Apex of Oceanfront Luxury" },
      { key: "hero_title_line_1", value: "Where Sky Meets" },
      { key: "hero_title_line_2", value: "Sanctuary" },
      {
        key: "hero_description",
        value: "Nestled along the pristine sands of the Aegean coastline, Ocean Hill Resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.",
      },
      { key: "theme_color_primary", value: "#D4AF37" },
      { key: "theme_color_secondary", value: "#FFFFFF" },
      { key: "theme_color_accent", value: "#1C1A17" },
      { key: "hero_video_url", value: "/videos/enhance_ocean_hill_villas.mp4" },
      { key: "hero_video_url_mobile", value: "/videos/enhance_ocean_hill_villas_mobile.mp4" },
      { key: "brand_name", value: "Ocean Hill" },
      { key: "brand_logo", value: "" },
      { key: "social_facebook", value: "https://facebook.com" },
      { key: "social_instagram", value: "https://instagram.com" },
      { key: "social_tiktok", value: "https://tiktok.com" },
      { key: "social_twitter", value: "https://twitter.com" },
    ]

    for (const setting of defaultSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
      console.log(`[Seed] Upserted setting: ${setting.key} -> "${setting.value.substring(0, 30)}..."`)
    }

    console.log("[Seed] Database seeding finished successfully!")
  } catch (error) {
    console.error("[Seed] Error seeding database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
