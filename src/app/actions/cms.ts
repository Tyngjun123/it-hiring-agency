"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const ADMIN_EMAILS = ["tyngjun123@gmail.com"]

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/")
  }
  return session
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function createBlogPost(formData: FormData) {
  await requireAdmin()

  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-") ?? ""
  const title = (formData.get("title") as string)?.trim() ?? ""

  if (!slug || !title) redirect("/admin/blog/new?error=1")

  await prisma.blogPost.create({
    data: {
      slug,
      title,
      summary: (formData.get("summary") as string) || "",
      content: (formData.get("content") as string) || "",
      category: (formData.get("category") as string) || "General",
      author: (formData.get("author") as string) || "IT Hire Team",
      authorInitials: (formData.get("authorInitials") as string) || "IH",
      readTime: (formData.get("readTime") as string) || "5 min read",
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      metaTitle: (formData.get("metaTitle") as string) || null,
      metaDesc: (formData.get("metaDesc") as string) || null,
    },
  })

  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  redirect("/admin/blog")
}

export async function updateBlogPost(id: string, formData: FormData) {
  await requireAdmin()

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: (formData.get("title") as string).trim(),
      summary: (formData.get("summary") as string) || "",
      content: (formData.get("content") as string) || "",
      category: (formData.get("category") as string) || "General",
      author: (formData.get("author") as string) || "IT Hire Team",
      authorInitials: (formData.get("authorInitials") as string) || "IH",
      readTime: (formData.get("readTime") as string) || "5 min read",
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      metaTitle: (formData.get("metaTitle") as string) || null,
      metaDesc: (formData.get("metaDesc") as string) || null,
    },
  })

  revalidatePath("/blog")
  revalidatePath(`/blog/${id}`)
  revalidatePath("/admin/blog")
  redirect("/admin/blog")
}

export async function deleteBlogPost(id: string) {
  await requireAdmin()
  const post = await prisma.blogPost.findUnique({ where: { id } })
  if (post) {
    await prisma.blogPost.delete({ where: { id } })
    revalidatePath("/blog")
    revalidatePath(`/blog/${post.slug}`)
    revalidatePath("/admin/blog")
  }
}

export async function toggleBlogPublished(id: string, published: boolean) {
  await requireAdmin()
  await prisma.blogPost.update({ where: { id }, data: { published } })
  revalidatePath("/blog")
  revalidatePath("/admin/blog")
}

// ── CMS Content (contact / about) ─────────────────────────────────────────────

export async function saveCmsContent(formData: FormData) {
  await requireAdmin()

  const entries = Array.from(formData.entries())
  for (const [key, value] of entries) {
    await prisma.cmsContent.upsert({
      where: { key },
      update: { value: value as string },
      create: { key, value: value as string },
    })
  }

  revalidatePath("/contact")
  revalidatePath("/about")
  revalidatePath("/admin/cms")
  redirect("/admin/cms?saved=1")
}
