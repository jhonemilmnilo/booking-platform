import * as dotenv from "dotenv"
dotenv.config()

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminEmail = "rogelioangeloduque@gmail.com"
const adminPassword = "AdminPassword123!"

async function main() {
  console.log("[Seed] Starting database seeding...")
  
  // Dynamically import prisma to bypass ES Module import hoisting order
  const { default: prisma } = await import("../lib/prisma/client")

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
      console.log(`[Seed] Admin auth user already exists in Supabase with ID: ${supabaseUser.id}. Syncing password to seed credentials...`)
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        supabaseUser.id,
        {
          password: adminPassword,
          email_confirm: true,
        }
      )
      if (updateError) {
        throw new Error(`Failed to update admin credentials in Supabase: ${updateError.message}`)
      }
      supabaseUser = updateData.user
      console.log(`[Seed] Admin auth credentials successfully synced.`)
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
        value: "Nestled along the pristine sands of the Aegean coastline, OceanHilling Resort features sprawling lagoon pools, private beach club lounges, and world-class personalized curation.",
      },
      { key: "theme_color_primary", value: "#D4AF37" },
      { key: "theme_color_secondary", value: "#FFFFFF" },
      { key: "theme_color_accent", value: "#1C1A17" },
      { key: "hero_video_url", value: "/videos/enhance_ocean_hill_villas.mp4" },
      { key: "hero_video_url_mobile", value: "/videos/enhance_ocean_hill_villas_mobile.mp4" },
      { key: "brand_name", value: "OceanHilling" },
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

    // 4. Seed Default Suites/Rooms
    console.log(`[Seed] Seeding initial suites collection...`)
    const defaultSuites = [
      {
        id: "5br-6ba-private-pool-villa",
        name: "5BR/6BA Private Pool Villa",
        description: "Our premier signature resort residence. Boasts 5 luxurious bedrooms, 6 bathrooms, a private pool, a complete kitchen, and a spacious package inclusive of breakfast for 18 guests. Enjoy ocean views and elite comfort.",
        pricePerNight: 55000,
        capacity: 25,
        imageUrl: "/images/image7.webp",
        size: "5 Bedrooms / 6 Baths",
        amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
        images: ["/images/image7.webp", "/images/image.png", "/images/image5.png", "/images/image4.png"],
      },
      {
        id: "3br-3ba-private-pool-villa",
        name: "3BR/3BA Private Pool Villa",
        description: "A gorgeous coastal retreat featuring 3 beautifully appointed bedrooms, 3 bathrooms, and a private pool. The package includes breakfast for 12 guests, perfect for families and small groups.",
        pricePerNight: 41000,
        capacity: 20,
        imageUrl: "/images/image1.png",
        size: "3 Bedrooms / 3 Baths",
        amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
        images: ["/images/image1.png", "/images/image3.png", "/images/image4.png", "/images/image.png"],
      },
      {
        id: "2br-2ba-private-pool-villa-a",
        name: "2BR/2BA Private Pool Villa A",
        description: "Sleek and comfortable private villa hosting 2 bedrooms, 2 bathrooms, a private pool, and breakfast for 6 guests. Ideal for close-knit groups seeking a peaceful getaway.",
        pricePerNight: 21000,
        capacity: 8,
        imageUrl: "/images/image2.png",
        size: "2 Bedrooms / 2 Baths (A)",
        amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
        images: ["/images/image2.png", "/images/image6.png", "/images/image5.png", "/images/image3.png"],
      },
      {
        id: "2br-2ba-private-pool-villa-b",
        name: "2BR/2BA Private Pool Villa B",
        description: "A larger alternative to Villa A, featuring 2 bedrooms, 2 bathrooms, and a private pool. Accommodates up to 10 guests and includes breakfast for 6 guests.",
        pricePerNight: 23000,
        capacity: 10,
        imageUrl: "/images/image3.png",
        size: "2 Bedrooms / 2 Baths (B)",
        amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
        images: ["/images/image3.png", "/images/image4.png", "/images/image5.png", "/images/image6.png"],
      },
      {
        id: "1br-1ba-private-pool-villa",
        name: "1BR/1BA Private Pool Villa",
        description: "An intimate romantic sanctuary featuring 1 bedroom, 1 bathroom, and a private pool. The package includes breakfast for 2 guests, perfect for couples.",
        pricePerNight: 13000,
        capacity: 5,
        imageUrl: "/images/image4.png",
        size: "1 Bedroom / 1 Bath",
        amenities: ["Private Pool", "Breakfast Included", "Private Kitchen", "Access to Main Pool & View Deck", "Airconditioning", "Pet-friendly", "TV", "Linens & Towels"],
        images: ["/images/image4.png", "/images/image5.png", "/images/image6.png", "/images/image.png"],
      },
    ]

    // Clear out any old rooms that are not in the new collection
    const activeIds = defaultSuites.map((s) => s.id)
    const deleteCount = await prisma.room.deleteMany({
      where: {
        id: {
          notIn: activeIds,
        },
      },
    })
    console.log(`[Seed] Removed ${deleteCount.count} outdated room/suite records.`)

    for (const suite of defaultSuites) {
      await prisma.room.upsert({
        where: { id: suite.id },
        update: {
          name: suite.name,
          description: suite.description,
          pricePerNight: suite.pricePerNight,
          capacity: suite.capacity,
          imageUrl: suite.imageUrl,
          size: suite.size,
          amenities: suite.amenities,
          images: suite.images,
        },
        create: {
          id: suite.id,
          name: suite.name,
          description: suite.description,
          pricePerNight: suite.pricePerNight,
          capacity: suite.capacity,
          imageUrl: suite.imageUrl,
          size: suite.size,
          amenities: suite.amenities,
          images: suite.images,
        },
      })
      console.log(`[Seed] Upserted room/suite: ${suite.id} -> "${suite.name}"`)
    }

    // 5. Seed Default Bookings
    console.log(`[Seed] Seeding sample bookings...`)
    const today = new Date()
    
    // helper to get date offset
    const getDateOffset = (days: number) => {
      const d = new Date(today)
      d.setDate(today.getDate() + days)
      d.setHours(14, 0, 0, 0)
      return d
    }

    const sampleBookings = [
      {
        reference: "OHR-782163",
        guestName: "Sophia Loren",
        guestEmail: "sophia.loren@example.com",
        guestPhone: "+639171234567",
        roomId: "5br-6ba-private-pool-villa",
        roomName: "5BR/6BA Private Pool Villa",
        pricePerNight: 55000,
        checkIn: getDateOffset(2),
        checkOut: getDateOffset(5),
        nights: 3,
        totalPrice: 165000,
        status: "CONFIRMED",
      },
      {
        reference: "OHR-451298",
        guestName: "Liam Neeson",
        guestEmail: "liam.neeson@example.com",
        guestPhone: "+639189876543",
        roomId: "3br-3ba-private-pool-villa",
        roomName: "3BR/3BA Private Pool Villa",
        pricePerNight: 41000,
        checkIn: getDateOffset(-1),
        checkOut: getDateOffset(2),
        nights: 3,
        totalPrice: 123000,
        status: "CHECKED_IN",
      },
      {
        reference: "OHR-239104",
        guestName: "Charlotte Bronte",
        guestEmail: "charlotte@example.com",
        guestPhone: "+639097766554",
        roomId: "1br-1ba-private-pool-villa",
        roomName: "1BR/1BA Private Pool Villa",
        pricePerNight: 13000,
        checkIn: getDateOffset(-5),
        checkOut: getDateOffset(-2),
        nights: 3,
        totalPrice: 39000,
        status: "COMPLETED",
      },
      {
        reference: "OHR-901842",
        guestName: "Alexander Hamilton",
        guestEmail: "alexander@example.com",
        guestPhone: "+639201112222",
        roomId: "2br-2ba-private-pool-villa-a",
        roomName: "2BR/2BA Private Pool Villa A",
        pricePerNight: 21000,
        checkIn: getDateOffset(-10),
        checkOut: getDateOffset(-8),
        nights: 2,
        totalPrice: 42000,
        status: "CANCELLED",
      },
    ]

    for (const booking of sampleBookings) {
      await prisma.booking.upsert({
        where: { reference: booking.reference },
        update: {
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          roomId: booking.roomId,
          roomName: booking.roomName,
          pricePerNight: booking.pricePerNight,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: booking.nights,
          totalPrice: booking.totalPrice,
          status: booking.status,
        },
        create: {
          reference: booking.reference,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          roomId: booking.roomId,
          roomName: booking.roomName,
          pricePerNight: booking.pricePerNight,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: booking.nights,
          totalPrice: booking.totalPrice,
          status: booking.status,
        },
      })
      console.log(`[Seed] Upserted booking: ${booking.reference} (${booking.status}) -> "${booking.guestName}"`)
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
