import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { updateBlogPost } from "@/app/actions/cms"
import { BLOG_CATEGORIES } from "@/data/posts"

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.blogPost.findUnique({ where: { id } })
  if (!post) notFound()

  const action = updateBlogPost.bind(null, id)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div>
          <Link href="/admin/blog" className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            ← Blog CMS
          </Link>
          <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mt-2">Edit post</h1>
          <p className="text-sm text-[#9CA3AF]">/blog/{post.slug}</p>
        </div>

        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-7 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          <form action={action} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Title *</Label>
                <Input name="title" required defaultValue={post.title}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Slug</Label>
                <Input value={post.slug} readOnly
                  className="rounded-[11px] border-[#E6E2D9] bg-[#F4F1EA] font-mono text-sm text-[#9CA3AF] cursor-not-allowed" />
                <p className="text-[11px] text-[#9CA3AF]">Slug cannot be changed after creation (affects URLs)</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Category *</Label>
                <select name="category" required defaultValue={post.category}
                  className="w-full border border-[#E6E2D9] rounded-[11px] px-3 py-2 text-sm bg-white text-[#1C1C1E] focus:border-[#F97316] focus:outline-none">
                  {BLOG_CATEGORIES.filter(c => c !== "All").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="General">General</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Summary *</Label>
                <Textarea name="summary" required rows={2} defaultValue={post.summary}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">
                  Content * <span className="text-[#9CA3AF] font-normal">(HTML supported)</span>
                </Label>
                <Textarea name="content" required rows={16} defaultValue={post.content}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] font-mono text-[13px] resize-y" />
              </div>
            </div>

            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Author</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Author name</Label>
                <Input name="author" defaultValue={post.author}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Initials</Label>
                <Input name="authorInitials" maxLength={2} defaultValue={post.authorInitials}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] w-24" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Read time</Label>
                <Input name="readTime" defaultValue={post.readTime}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>
            </div>

            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">SEO</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Meta title</Label>
                <Input name="metaTitle" defaultValue={post.metaTitle ?? ""}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Meta description</Label>
                <Textarea name="metaDesc" rows={2} maxLength={160} defaultValue={post.metaDesc ?? ""}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" defaultChecked={post.featured}
                  className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30" />
                <span className="text-[13.5px] font-semibold text-[#3A3A3C]">Featured post</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="published" defaultChecked={post.published}
                  className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30" />
                <span className="text-[13.5px] font-semibold text-[#3A3A3C]">Published</span>
              </label>
            </div>

            <Button type="submit"
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] h-11 shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
              Save changes
            </Button>
          </form>
        </div>

      </main>
    </div>
  )
}
