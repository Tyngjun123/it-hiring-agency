import { unstable_cache } from "next/cache"
import { prisma } from "./prisma"

export const getSiteConfig = unstable_cache(
  async () => {
    try {
      return await prisma.siteConfig.findUnique({ where: { id: "singleton" } })
    } catch {
      return null
    }
  },
  ["site-config"],
  { revalidate: 60, tags: ["site-config"] }
)
