"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath, revalidateTag } from "next/cache"
import { isAdminEmail } from "@/lib/admin"

async function requireAdmin() {
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) {
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
      author: (formData.get("author") as string) || "StackTalentx Team",
      authorInitials: (formData.get("authorInitials") as string) || "IH",
      readTime: (formData.get("readTime") as string) || "5 min read",
      coverImageUrl: (formData.get("coverImageUrl") as string) || null,
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      metaTitle: (formData.get("metaTitle") as string) || null,
      metaDesc: (formData.get("metaDesc") as string) || null,
    },
  })

  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  redirect("/admin/blog?toast=blog_saved")
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
      author: (formData.get("author") as string) || "StackTalentx Team",
      authorInitials: (formData.get("authorInitials") as string) || "IH",
      readTime: (formData.get("readTime") as string) || "5 min read",
      coverImageUrl: (formData.get("coverImageUrl") as string) || null,
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      metaTitle: (formData.get("metaTitle") as string) || null,
      metaDesc: (formData.get("metaDesc") as string) || null,
    },
  })

  revalidatePath("/blog")
  revalidatePath(`/blog/${id}`)
  revalidatePath("/admin/blog")
  redirect("/admin/blog?toast=blog_saved")
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
  redirect("/admin/cms?toast=cms_saved")
}

// ── Site Settings (SiteConfig) ────────────────────────────────────────────────

export async function saveSiteSettings(formData: FormData) {
  await requireAdmin()

  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: {
      logoUrl: (formData.get("logoUrl") as string) || null,
      contactPhone: (formData.get("contactPhone") as string) || null,
      contactEmail: (formData.get("contactEmail") as string) || null,
      facebookUrl: (formData.get("facebookUrl") as string) || null,
      instagramUrl: (formData.get("instagramUrl") as string) || null,
      linkedinUrl: (formData.get("linkedinUrl") as string) || null,
      twitterUrl: (formData.get("twitterUrl") as string) || null,
    },
    create: {
      id: "singleton",
      logoUrl: (formData.get("logoUrl") as string) || null,
      contactPhone: (formData.get("contactPhone") as string) || null,
      contactEmail: (formData.get("contactEmail") as string) || null,
      facebookUrl: (formData.get("facebookUrl") as string) || null,
      instagramUrl: (formData.get("instagramUrl") as string) || null,
      linkedinUrl: (formData.get("linkedinUrl") as string) || null,
      twitterUrl: (formData.get("twitterUrl") as string) || null,
    },
  })

  revalidateTag("site-config", "default")
  revalidatePath("/admin/settings")
  redirect("/admin/settings?toast=settings_saved")
}

export async function toggleMaintenanceMode(enabled: boolean) {
  await requireAdmin()

  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: { maintenanceMode: enabled },
    create: { id: "singleton", maintenanceMode: enabled },
  })

  revalidateTag("site-config", "default")
  revalidatePath("/admin/settings")
  redirect(`/admin/settings?toast=maintenance_${enabled ? "on" : "off"}`)
}

export async function toggleMaxPlan(enabled: boolean) {
  await requireAdmin()

  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: { maxPlanEnabled: enabled },
    create: { id: "singleton", maxPlanEnabled: enabled },
  })

  revalidateTag("site-config", "default")
  revalidatePath("/admin/settings")
  revalidatePath("/pricing")
  revalidatePath("/company/billing")
  redirect(`/admin/settings?maxplan=${enabled ? "on" : "off"}`)
}

export async function toggleProPlan(enabled: boolean) {
  await requireAdmin()

  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: { proPlanEnabled: enabled },
    create: { id: "singleton", proPlanEnabled: enabled },
  })

  revalidateTag("site-config", "default")
  revalidatePath("/admin/settings")
  revalidatePath("/pricing")
  revalidatePath("/company/billing")
  redirect(`/admin/settings?proplan=${enabled ? "on" : "off"}`)
}

// ── Email templates ───────────────────────────────────────────────────────────

export async function saveEmailTemplate(formData: FormData) {
  await requireAdmin()

  const key = formData.get("key") as string
  const name = formData.get("name") as string
  const subject = (formData.get("subject") as string)?.trim()
  const body = (formData.get("body") as string)?.trim()

  if (!key || !subject || !body) redirect("/admin/emails?error=1")

  await prisma.emailTemplate.upsert({
    where: { key },
    update: { name, subject, body },
    create: { key, name, subject, body },
  })

  revalidatePath("/admin/emails")
  redirect("/admin/emails?toast=email_saved")
}

export async function resetEmailTemplate(key: string) {
  await requireAdmin()
  await prisma.emailTemplate.deleteMany({ where: { key } })
  revalidatePath("/admin/emails")
}

// ── Job Moderation ────────────────────────────────────────────────────────────

export async function toggleJobHot(id: string, isHot: boolean) {
  await requireAdmin()
  await prisma.jobListing.update({ where: { id }, data: { isHot } })
  revalidatePath("/")
  revalidatePath("/admin/jobs")
}

export async function bulkUpdateJobStatus(ids: string[], status: "ACTIVE" | "PAUSED" | "CLOSED") {
  await requireAdmin()
  if (ids.length === 0) return
  await prisma.jobListing.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
  revalidatePath("/")
  revalidatePath("/admin/jobs")
}

export async function adjustJobPriority(id: string, direction: "up" | "down") {
  await requireAdmin()
  const job = await prisma.jobListing.findUnique({ where: { id }, select: { priority: true } })
  if (!job) return
  const newPriority = direction === "up" ? job.priority + 1 : Math.max(0, job.priority - 1)
  await prisma.jobListing.update({ where: { id }, data: { priority: newPriority } })
  revalidatePath("/")
  revalidatePath("/admin/jobs")
}
