import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog"
import { getSiteUrl } from "@/lib/site-url"
import ShareButtons from "@/components/share-buttons"
import type { Metadata } from "next"

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title + " | TechireX Blog",
    description: post.summary,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  const allPosts = await getAllBlogPosts()
  const related = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 pb-16">

        {/* Back link */}
        <Link href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9CA3AF] hover:text-[#1C1C1E] transition-colors mb-7">
          ← Blog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-7 items-start">

          {/* Article */}
          <article className="bg-white border border-[#EEEBE3] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,.03),0_10px_26px_rgba(28,28,30,.05)]">

            <div className="px-8 md:px-10 pt-9 pb-7">
              {/* Breadcrumb */}
              <div className="text-[13px] text-[#9CA3AF] mb-5">
                <Link href="/blog" className="hover:text-[#6B7280] transition-colors">Blog</Link>
                {post.category && (
                  <>
                    <span className="text-[#D6D2C8] mx-2">/</span>
                    <Link href={`/blog?cat=${encodeURIComponent(post.category)}`}
                      className="text-[#6B7280] hover:text-[#1C1C1E] transition-colors">
                      {post.category}
                    </Link>
                  </>
                )}
              </div>

              {/* Category label */}
              {post.category && (
                <p className="text-[12.5px] font-bold text-[#F97316] uppercase tracking-[.06em] mb-3.5">
                  {post.category}
                </p>
              )}

              {/* Title */}
              <h1 className="text-[32px] md:text-[36px] font-extrabold text-[#1C1C1E] tracking-[-0.03em] leading-[1.12] mb-5">
                {post.title}
              </h1>

              {/* Author row */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-[42px] h-[42px] rounded-full bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-[15px] shrink-0">
                  {post.authorInitials}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1C1C1E]">{post.author}</p>
                  <p className="text-[12.5px] text-[#9CA3AF]">
                    {new Date(post.date).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                    {post.readTime ? ` · ${post.readTime}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Hero image */}
            {post.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-[260px] mx-0 rounded-none md:mx-8 md:w-[calc(100%-4rem)] md:rounded-[16px] object-cover mb-8"
              />
            ) : (
              <div className="h-[260px] mx-8 md:mx-10 rounded-[16px] mb-8 flex items-center justify-center"
                style={{ background: post.cover ?? "repeating-linear-gradient(135deg, #FFF1E1, #FFF1E1 16px, #FFE8CF 16px, #FFE8CF 32px)" }}>
              </div>
            )}

            {/* Body */}
            <div className="px-8 md:px-10 pb-10">
              <div
                className="prose prose-base max-w-none
                  prose-headings:font-extrabold prose-headings:text-[#1C1C1E] prose-headings:tracking-tight
                  prose-p:text-[#3A3A3C] prose-p:leading-[1.75]
                  prose-li:text-[#3A3A3C] prose-li:leading-relaxed
                  prose-a:text-[#F97316] prose-a:no-underline hover:prose-a:underline
                  [&_blockquote]:not-italic [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#F97316]
                  [&_blockquote]:bg-[#FFF7ED] [&_blockquote]:rounded-r-[12px]
                  [&_blockquote]:text-[#9A3412] [&_blockquote]:font-semibold [&_blockquote]:leading-relaxed
                  [&_blockquote_p]:text-[#9A3412] [&_blockquote_p]:mb-0"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags + share */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#ECE9E1] flex-wrap gap-4">
                <div className="flex flex-wrap gap-2">
                  {post.category && (
                    <Link href={`/blog?cat=${encodeURIComponent(post.category)}`}
                      className="bg-[#F6F4EE] text-[#4B5563] text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full border border-[#EAE7DF] hover:border-[#F97316] hover:text-[#C2410C] transition-colors">
                      {post.category}
                    </Link>
                  )}
                  <span className="bg-[#F6F4EE] text-[#4B5563] text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full border border-[#EAE7DF]">
                    Malaysia
                  </span>
                  <span className="bg-[#F6F4EE] text-[#4B5563] text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full border border-[#EAE7DF]">
                    Tech
                  </span>
                </div>
                <ShareButtons url={`${getSiteUrl()}/blog/${slug}`} title={post.title} variant="compact" />
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-6">

            {/* Browse jobs CTA */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,.03),0_10px_26px_rgba(28,28,30,.05)]">
              <div className="w-10 h-10 rounded-[11px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-xl mb-3">
                →
              </div>
              <h3 className="text-[15px] font-extrabold text-[#1C1C1E] mb-1.5">Ready to find your next role?</h3>
              <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">
                Browse IT jobs in Malaysia matched to your stack and seniority.
              </p>
              <Link href="/"
                className="block w-full bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-bold py-2.5 rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors text-center">
                Browse jobs
              </Link>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,.03),0_10px_26px_rgba(28,28,30,.05)]">
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-4">More in {post.category}</p>
                <div className="space-y-4">
                  {related.map((r) => (
                    <Link key={r.slug} href={`/blog/${r.slug}`}
                      className="block group">
                      <p className="text-[13.5px] font-bold text-[#1C1C1E] leading-snug group-hover:text-[#F97316] transition-colors">
                        {r.title}
                      </p>
                      <p className="text-[12px] text-[#9CA3AF] mt-1">{r.readTime}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
