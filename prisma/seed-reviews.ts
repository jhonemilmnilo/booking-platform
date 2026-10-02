import * as dotenv from "dotenv"
dotenv.config()

async function main() {
  console.log("[Seed-Reviews] Starting review seeding...")
  const { default: prisma } = await import("../lib/prisma/client")

  try {
    const defaultReviews = [
      {
        guestName: "Alessandra Rossi",
        rating: 5,
        stayDate: "May 2026",
        comment: "Breathtaking views and top-tier hospitality. The private infinity pool is unmatched.",
        videoUrl: "/videos/enhance_ocean_hill_villas_mobile.mp4",
        imageUrl: "/images/image7.webp",
        isApproved: true,
      },
      {
        guestName: "Julian Vance",
        rating: 5,
        stayDate: "June 2026",
        comment: "Simply paradise. Waking up to the sea waves is something I will never forget.",
        videoUrl: "/videos/enhance_ocean_hill_villas.mp4",
        imageUrl: "/images/image1.png",
        isApproved: true,
      },
      {
        guestName: "Clara Dupont",
        rating: 5,
        stayDate: "April 2026",
        comment: "Bespoke privileges made our honeymoon feel so magical. 10/10 curation.",
        videoUrl: "/ocean_hill_villa.mp4",
        imageUrl: "/images/image2.png",
        isApproved: true,
      },
      {
        guestName: "Lord Marcus Sterling",
        rating: 5,
        stayDate: "March 2026",
        comment: "An architectural marvel on the shoreline. The private chef curation and attentive staff redefined luxury for us.",
        videoUrl: "/videos/enhance_ocean_hill_villas_mobile.mp4",
        imageUrl: "/images/image3.png",
        isApproved: true,
      },
      {
        guestName: "Evelyn & Thomas Zhao",
        rating: 5,
        stayDate: "February 2026",
        comment: "Watching the sunset from the overwater terrace with complimentary champagne is an experience we will cherish forever.",
        videoUrl: null,
        imageUrl: "/images/image4.png",
        isApproved: true,
      },
      {
        guestName: "Dr. Henrik Lindqvist",
        rating: 5,
        stayDate: "January 2026",
        comment: "Peace, privacy, and impeccable service. The wellness pavilion and lagoon villas exceeded every expectation.",
        videoUrl: null,
        imageUrl: "/images/image5.png",
        isApproved: true,
      }
    ]

    const existingCount = await prisma.review.count()
    if (existingCount === 0) {
      for (const review of defaultReviews) {
        await prisma.review.create({
          data: review,
        })
        console.log(`[Seed-Reviews] Created review: "${review.guestName}" (${review.stayDate})`)
      }
    } else {
      console.log(`[Seed-Reviews] ${existingCount} reviews already exist in the database.`)
    }

    console.log("[Seed-Reviews] Completed successfully!")
  } catch (error) {
    console.error("[Seed-Reviews] Error seeding reviews:", error)
    process.exit(1)
  } finally {
    const { default: prisma } = await import("../lib/prisma/client")
    await prisma.$disconnect()
  }
}

main()
