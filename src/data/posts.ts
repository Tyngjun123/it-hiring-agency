export type Post = {
  slug: string
  title: string
  date: string       // YYYY-MM-DD
  summary: string
  content: string    // HTML — use <p>, <h2>, <ul>, <strong>, <a> tags
}

// ─── Add your blog posts here ─────────────────────────────────────────────────
export const posts: Post[] = [
  {
    slug: "welcome-to-it-hire",
    title: "Welcome to IT Hire — Malaysia's IT Job Platform",
    date: "2026-06-15",
    summary: "We launched IT Hire to connect Malaysia's IT talent with companies that truly need them. Here's why we built it.",
    content: `
      <p>Finding an IT job in Malaysia shouldn't feel like searching for a needle in a haystack. General job boards are flooded with non-tech listings, making it hard for IT professionals to find the right roles — and for companies to reach the right candidates.</p>

      <h2>Why IT Hire?</h2>
      <p>IT Hire is built exclusively for the Malaysian IT industry. Whether you're a backend developer, QA engineer, project manager, or infrastructure specialist — every job on this platform is relevant to you.</p>

      <h2>For job seekers</h2>
      <ul>
        <li>Browse IT-only listings across Malaysia</li>
        <li>Apply in seconds — no cover letters required</li>
        <li>Get notified when companies update your application status</li>
      </ul>

      <h2>For companies</h2>
      <ul>
        <li>Post up to 10 jobs for free</li>
        <li>Reach a targeted pool of IT professionals</li>
        <li>Boost your listings to appear at the top of search results</li>
      </ul>

      <p>We're just getting started. Stay tuned for more updates.</p>
    `,
  },
]
