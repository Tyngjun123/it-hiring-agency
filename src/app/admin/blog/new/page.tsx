export const dynamic = "force-dynamic"

import Navbar from "@/components/navbar"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createBlogPost } from "@/app/actions/cms"
import { BLOG_CATEGORIES } from "@/data/posts"
import ImageUploader from "@/components/admin/image-uploader"

export default async function NewBlogPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div>
          <Link href="/admin/blog" className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            ← Blog CMS
          </Link>
          <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mt-2">New blog post</h1>
        </div>

        {error === "1" && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm text-[#DC2626] font-medium">
            Slug and title are required.
          </div>
        )}

        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-7 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          <form action={createBlogPost} className="space-y-5">
            <BlogPostFields />
          </form>
        </div>

      </main>
    </div>
  )
}

export function BlogPostFields({ defaults }: { defaults?: Record<string, string | boolean | null | undefined> }) {
  const d = defaults ?? {}
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Title *</Label>
          <Input name="title" required placeholder="e.g. Top IT Salaries in KL 2025" defaultValue={d.title as string ?? ""}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Slug * <span className="text-[#9CA3AF] font-normal">(URL path)</span></Label>
          <Input name="slug" required placeholder="e.g. it-salaries-kl-2025" defaultValue={d.slug as string ?? ""}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] font-mono text-sm" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Category *</Label>
          <select name="category" required defaultValue={d.category as string ?? "General"}
            className="w-full border border-[#E6E2D9] rounded-[11px] px-3 py-2 text-sm bg-white text-[#1C1C1E] focus:border-[#F97316] focus:outline-none">
            {BLOG_CATEGORIES.filter(c => c !== "All").map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="General">General</option>
          </select>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Summary *</Label>
          <Textarea name="summary" required rows={2} placeholder="One or two sentences describing the post…"
            defaultValue={d.summary as string ?? ""}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">
            Content * <span className="text-[#9CA3AF] font-normal">(HTML supported)</span>
          </Label>
          <Textarea name="content" required rows={16} placeholder="<p>Your post content here…</p>"
            defaultValue={d.content as string ?? ""}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] font-mono text-[13px] resize-y" />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">
            Cover image <span className="text-[#9CA3AF] font-normal">(optional)</span>
          </Label>
          <ImageUploader name="coverImageUrl" defaultValue={d.coverImageUrl as string ?? ""} />
        </div>
      </div>

      <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Author</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Author name</Label>
          <Input name="author" defaultValue={d.author as string ?? "TechireX Team"}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Initials</Label>
          <Input name="authorInitials" maxLength={2} defaultValue={d.authorInitials as string ?? "IH"}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] w-24" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Read time</Label>
          <Input name="readTime" placeholder="5 min read" defaultValue={d.readTime as string ?? "5 min read"}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>
      </div>

      <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">SEO</p>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Meta title <span className="text-[#9CA3AF] font-normal">(optional, defaults to post title)</span></Label>
          <Input name="metaTitle" placeholder="e.g. IT Salaries in KL 2025 | TechireX" defaultValue={d.metaTitle as string ?? ""}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Meta description <span className="text-[#9CA3AF] font-normal">(optional, max 160 chars)</span></Label>
          <Textarea name="metaDesc" rows={2} maxLength={160} placeholder="Short description for search engines…"
            defaultValue={d.metaDesc as string ?? ""}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
        </div>
      </div>

      <div className="flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="featured" defaultChecked={!!d.featured}
            className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30" />
          <span className="text-[13.5px] font-semibold text-[#3A3A3C]">Featured post</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="published" defaultChecked={!!d.published}
            className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30" />
          <span className="text-[13.5px] font-semibold text-[#3A3A3C]">Published</span>
        </label>
      </div>

      <div className="pt-1">
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Auto-share when published</p>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="shareTelegram" defaultChecked={d.shareTelegram !== false}
              className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30" />
            <span className="text-[13.5px] font-semibold text-[#3A3A3C]">一并发去 Telegram</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="shareFacebook" defaultChecked={d.shareFacebook !== false}
              className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30" />
            <span className="text-[13.5px] font-semibold text-[#3A3A3C]">一并发去 Facebook Page</span>
          </label>
        </div>
      </div>

      <Button type="submit"
        className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] h-11 shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
        Save post
      </Button>
    </>
  )
}
