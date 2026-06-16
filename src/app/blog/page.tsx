import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { posts } from "@/data/posts"

export default function BlogPage() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Updates, tips, and insights from the IT Hire team</p>
        </div>

        <div className="space-y-4">
          {sorted.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="block bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-300 transition-colors">
              <p className="text-xs text-gray-400 mb-1">
                {new Date(post.date).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h2 className="font-semibold text-gray-900">{post.title}</h2>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.summary}</p>
              <p className="text-sm text-blue-600 mt-3">Read more →</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
