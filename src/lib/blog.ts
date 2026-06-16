import { prisma } from "@/lib/prisma"
import { posts as staticPosts } from "@/data/posts"

export type BlogPostData = {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: string
  author: string
  authorInitials: string
  readTime: string
  cover?: string
  featured: boolean
  date: string
}

export async function getAllBlogPosts(): Promise<BlogPostData[]> {
  const dbPosts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  })

  const dbSlugs = new Set(dbPosts.map((p) => p.slug))

  const fromDb: BlogPostData[] = dbPosts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    content: p.content,
    category: p.category,
    author: p.author,
    authorInitials: p.authorInitials,
    readTime: p.readTime,
    cover: p.coverGradient ?? undefined,
    featured: p.featured,
    date: p.createdAt.toISOString().slice(0, 10),
  }))

  // Merge static posts that haven't been migrated to DB yet
  const fromStatic: BlogPostData[] = staticPosts
    .filter((p) => !dbSlugs.has(p.slug))
    .map((p) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      summary: p.summary ?? "",
      content: p.content,
      category: p.category ?? "General",
      author: p.author ?? "IT Hire Team",
      authorInitials: p.authorInitials ?? "IH",
      readTime: p.readTime ?? "5 min read",
      cover: p.cover,
      featured: p.featured ?? false,
      date: p.date,
    }))

  return [...fromDb, ...fromStatic].sort((a, b) => b.date.localeCompare(a.date))
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostData | null> {
  // Check DB first
  const dbPost = await prisma.blogPost.findUnique({ where: { slug, published: true } })
  if (dbPost) {
    return {
      id: dbPost.id,
      slug: dbPost.slug,
      title: dbPost.title,
      summary: dbPost.summary,
      content: dbPost.content,
      category: dbPost.category,
      author: dbPost.author,
      authorInitials: dbPost.authorInitials,
      readTime: dbPost.readTime,
      cover: dbPost.coverGradient ?? undefined,
      featured: dbPost.featured,
      date: dbPost.createdAt.toISOString().slice(0, 10),
    }
  }

  // Fall back to static
  const staticPost = staticPosts.find((p) => p.slug === slug)
  if (!staticPost) return null
  return {
    id: staticPost.slug,
    slug: staticPost.slug,
    title: staticPost.title,
    summary: staticPost.summary ?? "",
    content: staticPost.content,
    category: staticPost.category ?? "General",
    author: staticPost.author ?? "IT Hire Team",
    authorInitials: staticPost.authorInitials ?? "IH",
    readTime: staticPost.readTime ?? "5 min read",
    cover: staticPost.cover,
    featured: staticPost.featured ?? false,
    date: staticPost.date,
  }
}
