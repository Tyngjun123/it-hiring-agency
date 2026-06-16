import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { toggleBlogPublished, deleteBlogPost } from "@/app/actions/cms"

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight">Blog CMS</h1>
            <p className="text-sm text-[#9CA3AF] mt-0.5">{posts.length} posts</p>
          </div>
          <Link href="/admin/blog/new"
            className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-5 py-2.5 rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
            + New post
          </Link>
        </div>

        <div className="bg-white border border-[#EEEBE3] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[15px] font-bold text-[#1C1C1E]">No posts yet</p>
              <p className="text-sm text-[#9CA3AF] mt-1">Create your first blog post above</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F4F1EA] bg-[#FAFAF8]">
                  <th className="text-left px-5 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1EA]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1C1C1E] truncate max-w-[260px]">{post.title}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{post.slug}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-[#F97316] bg-[#FFF7ED] px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <form action={async () => {
                        "use server"
                        await toggleBlogPublished(post.id, !post.published)
                      }}>
                        <button type="submit"
                          className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            post.published
                              ? "bg-[#ECFDF5] text-[#16A34A] hover:bg-[#D1FAE5]"
                              : "bg-[#F4F1EA] text-[#9CA3AF] hover:bg-[#EEEBE3]"
                          }`}>
                          {post.published ? "Published" : "Draft"}
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#9CA3AF] whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/blog/${post.slug}`} target="_blank"
                          className="text-xs font-bold text-[#6B7280] hover:text-[#1C1C1E] transition-colors">
                          View ↗
                        </Link>
                        <Link href={`/admin/blog/${post.id}/edit`}
                          className="text-xs font-bold text-[#F97316] hover:text-[#EA580C] transition-colors">
                          Edit
                        </Link>
                        <form action={async () => {
                          "use server"
                          await deleteBlogPost(post.id)
                        }}>
                          <button type="submit"
                            className="text-xs font-bold text-[#DC2626] hover:text-[#B91C1C] transition-colors"
                            onClick={(e) => { if (!confirm("Delete this post?")) e.preventDefault() }}>
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex gap-3">
          <Link href="/admin" className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            ← Admin panel
          </Link>
          <Link href="/admin/cms" className="text-sm font-bold text-[#F97316] hover:text-[#EA580C] transition-colors">
            Contact &amp; About CMS →
          </Link>
        </div>

      </main>
    </div>
  )
}
