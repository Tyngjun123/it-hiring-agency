import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getSiteUrl } from "@/lib/site-url"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/companies", "/blog", "/about", "/contact",
    "/pricing", "/help", "/terms", "/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }))

  let dynamicRoutes: MetadataRoute.Sitemap = []
  try {
    const [jobs, posts, companies] = await Promise.all([
      prisma.jobListing.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.companyProfile.findMany({
        select: { id: true },
        take: 1000,
      }),
    ])

    dynamicRoutes = [
      ...jobs.map((j) => ({
        url: `${base}/jobs/${j.id}`,
        lastModified: j.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...posts.map((p) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
      ...companies.map((c) => ({
        url: `${base}/companies/${c.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ]
  } catch {
    // If DB is unavailable, still return static routes rather than failing the build/request
  }

  return [...staticRoutes, ...dynamicRoutes]
}
