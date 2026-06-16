import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { posts } from "@/data/posts"

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 space-y-6">
        <Link href="/blog" className="text-sm text-gray-400 hover:text-gray-600">← Blog</Link>

        <div className="bg-white border border-gray-100 rounded-xl p-8 space-y-4">
          <p className="text-xs text-gray-400">
            {new Date(post.date).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">{post.title}</h1>
          <p className="text-gray-500 text-sm">{post.summary}</p>
          <hr className="border-gray-100" />
          <div
            className="prose prose-sm prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
