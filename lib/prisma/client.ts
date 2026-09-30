import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const prismaClientSingleton = () => {
  let connectionString = process.env.DATABASE_URL
  if (connectionString) {
    connectionString = connectionString.replace(/([?&])sslmode=[^&]*/g, "")
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 10000, // Discard idle connections after 10s before Supabase PgBouncer closes them
    connectionTimeoutMillis: 8000, // Fail-fast timeout instead of hanging for 20+ seconds
    keepAlive: true, // Maintain TCP keep-alive packets to prevent cloud firewall termination
  })

  // Prevent idle client termination by Supabase/PgBouncer from crashing or corrupting the pool
  pool.on("error", (err) => {
    console.warn("[Prisma Pool] Discarding terminated idle connection:", err.message)
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma
}
