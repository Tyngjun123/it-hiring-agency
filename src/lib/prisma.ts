import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

// In development, recreate the client if the cached one is missing new models
// (happens after prisma generate while dev server is running).
function getOrCreatePrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    // Check if the cached client has the blogPost model; if not, recreate.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((globalForPrisma.prisma as any).blogPost === undefined) {
      globalForPrisma.prisma = createPrismaClient()
    }
    return globalForPrisma.prisma
  }
  return createPrismaClient()
}

export const prisma = getOrCreatePrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
