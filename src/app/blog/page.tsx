export const revalidate = 300

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { BLOG_CATEGORIES } from "@/data/posts"
import { getAllBlogPosts } from "@/lib/blog"

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const activeCat = cat && BLOG_CATEGORIES.includes(cat) ? cat : "All"

  const allPosts = await getAllBlogPosts()
  const featured = allPosts.find((p) => p.featured)

  const gridPosts =
    activeCat === "All"
      ? allPosts.filter((p) => !p.featured)
      : allPosts.filter((p) => p.category === activeCat)

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 pb-16">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FBDDBE] px-3.5 py-1.5 rounded-full text-[12.5px] font-bold text-[#C2410C] mb-4">
            The TechireX Blog
          </div>
          <h1 className="text-[26px] md:text-[38px] font-extrabold text-[#1C1C1E] tracking-[-0.03em] mb-3">
            Grow your tech career in Malaysia
          </h1>
          <p className="text-[16px] text-[#6B7280] leading-relaxed">
            Salary guides, interview prep and hiring insights — written for Malaysian developers and the teams who hire them.
          </p>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {BLOG_CATEGORIES.map((c) => (
            <Link key={c} href={c === "All" ? "/blog" : `/blog?cat=${encodeURIComponent(c)}`}
              className={`text-[13.5px] font-bold px-[17px] py-2 rounded-full transition-colors ${
                activeCat === c
                  ? "bg-[#F97316] text-white shadow-[0_5px_13px_rgba(249,115,22,0.26)]"
                  : "bg-white text-[#4B5563] border border-[#E6E2D9] hover:border-[#F97316] hover:text-[#C2410C]"
              }`}>
              {c}
            </Link>
          ))}
        </div>

        {/* Featured post (only on "All") */}
        {activeCat === "All" && featured && (
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] bg-white border border-[#EEEBE3] rounded-[18px] overflow-hidden mb-7 shadow-[0_1px_2px_rgba(28,28,30,.03),0_10px_26px_rgba(28,28,30,.05)]">
            {/* Cover placeholder */}
            <div className="min-h-[220px] md:min-h-[290px] relative flex items-end p-6"
              style={{ background: featured.cover ?? "repeating-linear-gradient(135deg, #FFF1E1, #FFF1E1 13px, #FFE8CF 13px, #FFE8CF 26px)" }}>
              <span className="absolute top-4 left-4 bg-white text-[#C2410C] text-[11.5px] font-bold px-3 py-1.5 rounded-full">
                Featured
              </span>
              <span className="font-mono text-[12px] text-[#C99A6B]">[ cover image ]</span>
            </div>
            {/* Content */}
            <div className="p-8 flex flex-col justify-center">
              <p className="text-[12.5px] font-bold text-[#F97316] uppercase tracking-[.06em] mb-3">
                {featured.category}
              </p>
              <h2 className="text-[24px] font-extrabold text-[#1C1C1E] tracking-[-0.02em] leading-[1.2] mb-3">
                {featured.title}
              </h2>
              <p className="text-[14.5px] text-[#6B7280] leading-relaxed mb-5">{featured.summary}</p>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-[13px] shrink-0">
                  {featured.authorInitials}
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-[#1C1C1E]">{featured.author}</p>
                  <p className="text-[12px] text-[#9CA3AF]">
                    {new Date(featured.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                    {featured.readTime ? ` · ${featured.readTime}` : ""}
                  </p>
                </div>
              </div>
              <Link href={`/blog/${featured.slug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#F97316] hover:text-[#EA580C] transition-colors">
                Read article →
              </Link>
            </div>
          </div>
        )}

        {/* Post grid */}
        {gridPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[15px] font-bold text-[#1C1C1E]">No posts in this category yet</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Check back soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {gridPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="bg-white border border-[#EEEBE3] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(28,28,30,.03),0_8px_22px_rgba(28,28,30,.045)] hover:shadow-[0_2px_4px_rgba(28,28,30,.05),0_12px_30px_rgba(28,28,30,.08)] transition-shadow group">
                {/* Cover */}
                <div className="h-[150px] relative flex items-end p-3"
                  style={{ background: post.cover ?? "repeating-linear-gradient(135deg, #F6F4EE, #F6F4EE 13px, #EDEAE3 13px, #EDEAE3 26px)" }}>
                  <span className="font-mono text-[11px] text-[rgba(28,28,30,0.32)]">[ image ]</span>
                </div>
                {/* Content */}
                <div className="p-5">
                  <p className="text-[11.5px] font-bold text-[#F97316] uppercase tracking-[.06em] mb-2">
                    {post.category}
                  </p>
                  <h3 className="text-[16px] font-bold text-[#1C1C1E] tracking-[-0.01em] leading-[1.3] mb-2 group-hover:text-[#F97316] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[13.5px] text-[#6B7280] leading-[1.55] line-clamp-2 mb-4">
                    {post.summary}
                  </p>
                  <div className="flex items-center justify-between pt-3.5 border-t border-[#F4F1EA]">
                    <span className="text-[12px] text-[#9CA3AF]">{post.author}</span>
                    <span className="text-[12px] text-[#9CA3AF]">{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-8 border border-[#FBDDBE] rounded-[18px] px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ background: "linear-gradient(120deg, #FFF7ED, #FFEAD3)" }}>
          <div>
            <h3 className="text-[21px] font-extrabold text-[#1C1C1E] tracking-[-0.02em] mb-1.5">
              Tech jobs &amp; tips, every Tuesday
            </h3>
            <p className="text-[14.5px] text-[#7A6A56]">
              The best new Malaysian tech roles in your inbox — newsletter launching soon.
            </p>
          </div>
          <div className="flex gap-2.5 items-center w-full sm:w-auto">
            <input type="email" disabled placeholder="you@email.com"
              className="bg-white/60 border border-[#F7C99A] rounded-[12px] px-4 py-3 text-[14px] text-[#A8A49A] placeholder-[#C4BFB5] cursor-not-allowed sm:min-w-[210px] w-full" />
            <span className="bg-[#FCE4CB] text-[#C2410C] text-[14px] font-bold px-6 py-3 rounded-[12px] whitespace-nowrap shrink-0">
              Coming soon
            </span>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
