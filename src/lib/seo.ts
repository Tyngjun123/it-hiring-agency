import type { Metadata } from "next"
import { getCmsMap } from "@/lib/cms"

// ── Per-page SEO (CMS-editable) ───────────────────────────────────────────────
// Title, description and optional custom JSON-LD schema for each public page are
// stored as CmsContent rows and edited in the admin CMS "SEO & Meta" section.
// Existing keys (meta_contact_*, meta_about_*) are reused so no data is lost.

export type SeoPageKey =
  | "home"
  | "blog"
  | "about"
  | "contact"
  | "pricing"
  | "help"

type SeoPage = {
  label: string
  path: string
  titleKey: string
  descKey: string
  schemaKey: string
  title: string // default title
  desc: string // default description
}

export const SEO_PAGES: Record<SeoPageKey, SeoPage> = {
  home: {
    label: "Home / Jobs",
    path: "/",
    titleKey: "meta_home_title",
    descKey: "meta_home_desc",
    schemaKey: "schema_home",
    title: "TechireX — Find IT Jobs in Malaysia",
    desc: "The niche job platform for IT professionals in Malaysia. Browse developer, engineering and tech roles across KL and beyond.",
  },
  blog: {
    label: "Blog",
    path: "/blog",
    titleKey: "meta_blog_title",
    descKey: "meta_blog_desc",
    schemaKey: "schema_blog",
    title: "TechireX Blog — Tech Careers in Malaysia",
    desc: "Salary guides, interview prep and hiring insights — written for Malaysian developers and the teams who hire them.",
  },
  about: {
    label: "About",
    path: "/about",
    titleKey: "meta_about_title",
    descKey: "meta_about_desc",
    schemaKey: "schema_about",
    title: "About TechireX | Malaysia's IT Job Platform",
    desc: "Learn about TechireX — the job board built specifically for Malaysian IT professionals and the companies hiring them.",
  },
  contact: {
    label: "Contact",
    path: "/contact",
    titleKey: "meta_contact_title",
    descKey: "meta_contact_desc",
    schemaKey: "schema_contact",
    title: "Contact TechireX | Malaysia's IT Job Platform",
    desc: "Get in touch with the TechireX team for job posting, billing or partnership enquiries.",
  },
  pricing: {
    label: "Pricing",
    path: "/pricing",
    titleKey: "meta_pricing_title",
    descKey: "meta_pricing_desc",
    schemaKey: "schema_pricing",
    title: "Pricing — TechireX | IT Job Posting Plans in Malaysia",
    desc: "Simple plans for hiring IT talent in Malaysia. Post jobs, unlock the résumé pool and boost listings — free to start.",
  },
  help: {
    label: "Help Center",
    path: "/help",
    titleKey: "meta_help_title",
    descKey: "meta_help_desc",
    schemaKey: "schema_help",
    title: "Help Center — TechireX",
    desc: "Find answers to common questions about TechireX for candidates and employers.",
  },
}

// Resolves title/description for a page from the CMS (falling back to defaults)
// and returns a Next Metadata object with a canonical URL. Canonical is a path;
// Next resolves it against `metadataBase` (set in the root layout).
export async function buildPageMetadata(page: SeoPageKey): Promise<Metadata> {
  const def = SEO_PAGES[page]
  let title = def.title
  let description = def.desc
  try {
    const cms = await getCmsMap()
    title = cms[def.titleKey]?.trim() || def.title
    description = cms[def.descKey]?.trim() || def.desc
  } catch {
    // DB unavailable — fall back to defaults
  }
  return {
    title,
    description,
    alternates: { canonical: def.path },
    openGraph: {
      title,
      description,
      url: def.path,
      siteName: "TechireX",
      type: "website",
    },
  }
}

// Returns the admin-pasted custom JSON-LD for a page, or null. Rendered via the
// <RawJsonLd> component in each page.
export async function getPageSchema(page: SeoPageKey): Promise<string | null> {
  try {
    const cms = await getCmsMap()
    const raw = cms[SEO_PAGES[page].schemaKey]?.trim()
    return raw || null
  } catch {
    return null
  }
}
