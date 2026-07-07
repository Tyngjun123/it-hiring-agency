export type Post = {
  slug: string
  title: string
  date: string       // YYYY-MM-DD
  summary: string
  content: string    // HTML — use <p>, <h2>, <ul>, <strong>, <a> tags
  category?: string
  author?: string
  authorInitials?: string
  readTime?: string
  cover?: string     // CSS gradient for cover placeholder
  featured?: boolean
}

export const BLOG_CATEGORIES = ["All", "Salary Guide", "Interview Prep", "Hiring Tips", "Career"]

// Demo/template posts removed — blog content now comes only from posts you
// create in the admin CMS (stored in the database).
export const posts: Post[] = []
