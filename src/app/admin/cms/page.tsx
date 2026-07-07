export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { saveCmsContent } from "@/app/actions/cms"
import FaqEditor from "@/components/admin/faq-editor"
import { HELP_FAQS, PRICING_FAQS, HELP_FAQ_CATEGORIES, parseFaqs } from "@/data/faqs"
import PlanEditor from "@/components/admin/plan-editor"
import { PRICING_PLANS_DEFAULT, parsePlans } from "@/data/plans"
import ListEditor from "@/components/admin/list-editor"
import { ABOUT_VALUES_DEFAULT, ABOUT_TEAM_DEFAULT, parseList, type Value, type Member } from "@/data/about"

const DEFAULTS: Record<string, string> = {
  contact_email: "support@stacktalentx.com",
  contact_whatsapp: "https://wa.me/60123456789",
  contact_whatsapp_label: "Chat on WhatsApp →",
  contact_hours: "Mon–Fri, 9am–6pm MYT",
  contact_heading: "We'd love to hear from you",
  contact_intro: "Questions about posting a job, your account, or partnering with us? Our KL-based team usually replies within one business day.",
  meta_contact_title: "Contact TechireX | Malaysia's IT Job Platform",
  meta_contact_desc: "Get in touch with the TechireX team for job posting, billing or partnership enquiries.",
  about_tagline: "The job board Malaysia's tech industry deserved.",
  about_hero: "TechireX is a focused job platform built exclusively for Malaysian IT professionals and the companies that hire them. No noise. No middlemen. Just great tech jobs.",
  about_body: "<p>The hiring process for tech talent in Malaysia was broken. Candidates wasted hours on generic boards full of spam. Employers paid expensive agencies and still got mismatched candidates. TechireX was built to fix that.</p><p>We're a team of Malaysian developers and operators who got frustrated with the status quo. So we built the platform we always wanted — focused exclusively on IT, with transparent salaries, a clean application flow, and zero middlemen.</p><p>Every product decision we make is guided by one question: does this help a Malaysian developer find a great job faster, or help a Malaysian tech team find the right person faster?</p>",
  about_mission_heading: "Make finding and hiring tech talent in Malaysia feel effortless.",
  about_join_heading: "Want to join our team?",
  about_join_body: "We're always looking for talented people to help build Malaysia's IT job platform. Tell us how you'd like to contribute.",
  boost_title: "Boost a Job Listing",
  boost_desc: "Pin any listing to the top of search results for 30 days. Max plan includes 10 boost credits monthly.",
  boost_price: "RM 100",
  boost_period: "per listing / 30 days",
  boost_features: "Pin to top of search results for 30 days\nFeatured badge on listing\nHomepage banner spotlight (optional)\nPer listing — no subscription needed",
  meta_about_title: "About TechireX | Malaysia's IT Job Platform",
  meta_about_desc: "Learn about TechireX — the job board built specifically for Malaysian IT professionals and the companies hiring them.",
}

export default async function AdminCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>
}) {
  const { saved } = await searchParams

  const rows = await prisma.cmsContent.findMany()
  const cms: Record<string, string> = {}
  for (const row of rows) cms[row.key] = row.value

  function val(key: string) {
    return cms[key] ?? DEFAULTS[key] ?? ""
  }

  const helpFaqs = parseFaqs(cms["help_faqs"], HELP_FAQS)
  const pricingFaqs = parseFaqs(cms["pricing_faqs"], PRICING_FAQS)
  const pricingPlans = parsePlans(cms["pricing_plans"], PRICING_PLANS_DEFAULT)
  const aboutValues = parseList<Value>(cms["about_values"], ABOUT_VALUES_DEFAULT, (x) => !!x && typeof (x as Value).title === "string")
  const aboutTeam = parseList<Member>(cms["about_team"], ABOUT_TEAM_DEFAULT, (x) => !!x && typeof (x as Member).name === "string")

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              ← Admin panel
            </Link>
            <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mt-2">Content CMS</h1>
            <p className="text-sm text-[#9CA3AF]">Contact &amp; About page content</p>
          </div>
          <Link href="/admin/blog"
            className="text-sm font-bold text-[#F97316] hover:text-[#EA580C] transition-colors">
            Blog CMS →
          </Link>
        </div>

        {saved === "1" && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm text-[#047857] font-medium">
            Content saved successfully.
          </div>
        )}

        {/* Quick navigation — jump to a section */}
        <div className="flex flex-wrap gap-2 sticky top-16 z-10 bg-[#FAFAF8]/90 backdrop-blur py-2 -my-2">
          {[
            { id: "cms-contact", label: "Contact" },
            { id: "cms-about", label: "About" },
            { id: "cms-help", label: "Help FAQ" },
            { id: "cms-pricing-faq", label: "Pricing FAQ" },
            { id: "cms-pricing-plans", label: "Pricing Plans" },
          ].map((s) => (
            <a key={s.id} href={`#${s.id}`}
              className="text-[13px] font-bold text-[#3A3A3C] bg-white border border-[#E6E2D9] rounded-full px-3.5 py-1.5 hover:border-[#F97316] hover:text-[#F97316] transition-colors">
              {s.label}
            </a>
          ))}
        </div>

        <form action={saveCmsContent} className="space-y-6">

          {/* Contact page */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">✉</div>
              <h2 id="cms-contact" className="font-extrabold text-[#1C1C1E] scroll-mt-28">Contact page</h2>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Contact email</Label>
              <Input name="contact_email" defaultValue={val("contact_email")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">WhatsApp URL</Label>
              <Input name="contact_whatsapp" defaultValue={val("contact_whatsapp")} placeholder="https://wa.me/..."
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">WhatsApp button label</Label>
              <Input name="contact_whatsapp_label" defaultValue={val("contact_whatsapp_label")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Business hours</Label>
              <Input name="contact_hours" defaultValue={val("contact_hours")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Heading</Label>
              <Input name="contact_heading" defaultValue={val("contact_heading")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Intro paragraph</Label>
              <Textarea name="contact_intro" rows={3} defaultValue={val("contact_intro")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
            </div>
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">SEO</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Page title</Label>
                <Input name="meta_contact_title" defaultValue={val("meta_contact_title")}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Meta description</Label>
                <Textarea name="meta_contact_desc" rows={2} maxLength={160} defaultValue={val("meta_contact_desc")}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
              </div>
            </div>
          </div>

          {/* About page */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">ⓘ</div>
              <h2 id="cms-about" className="font-extrabold text-[#1C1C1E] scroll-mt-28">About us page</h2>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Tagline</Label>
              <Input name="about_tagline" defaultValue={val("about_tagline")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Hero paragraph</Label>
              <Textarea name="about_hero" rows={3} defaultValue={val("about_hero")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">
                Body content <span className="text-[#9CA3AF] font-normal">(HTML supported)</span>
              </Label>
              <Textarea name="about_body" rows={8} defaultValue={val("about_body")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] font-mono text-[13px] resize-y" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Mission heading</Label>
              <Input name="about_mission_heading" defaultValue={val("about_mission_heading")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Our values</Label>
              <ListEditor name="about_values" initial={aboutValues} itemLabel="Value"
                fields={[{ key: "icon", label: "Icon", small: true }, { key: "title", label: "Title" }, { key: "body", label: "Description", textarea: true }]} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Who we are (team)</Label>
              <ListEditor name="about_team" initial={aboutTeam} itemLabel="Member"
                fields={[{ key: "initials", label: "Initials", small: true }, { key: "name", label: "Name" }, { key: "role", label: "Role" }]} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">&ldquo;Join our team&rdquo; heading</Label>
              <Input name="about_join_heading" defaultValue={val("about_join_heading")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">&ldquo;Join our team&rdquo; text</Label>
              <Textarea name="about_join_body" rows={2} defaultValue={val("about_join_body")}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
            </div>
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">SEO</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Page title</Label>
                <Input name="meta_about_title" defaultValue={val("meta_about_title")}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Meta description</Label>
                <Textarea name="meta_about_desc" rows={2} maxLength={160} defaultValue={val("meta_about_desc")}
                  className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
              </div>
            </div>
          </div>

          {/* Help page FAQ */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">❓</div>
              <h2 id="cms-help" className="font-extrabold text-[#1C1C1E] scroll-mt-28">Help page — FAQ</h2>
            </div>
            <p className="text-[12.5px] text-[#9CA3AF]">Questions shown on the Help Center, grouped by category.</p>
            <FaqEditor name="help_faqs" initial={helpFaqs} categories={HELP_FAQ_CATEGORIES} />
          </div>

          {/* Pricing common questions */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">❓</div>
              <h2 id="cms-pricing-faq" className="font-extrabold text-[#1C1C1E] scroll-mt-28">Pricing page — Common questions</h2>
            </div>
            <FaqEditor name="pricing_faqs" initial={pricingFaqs} />
          </div>

          {/* Pricing plans */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">💳</div>
              <h2 id="cms-pricing-plans" className="font-extrabold text-[#1C1C1E] scroll-mt-28">Pricing page — Plans</h2>
            </div>
            <p className="text-[12.5px] text-[#9CA3AF]">Edit each plan&apos;s name, price, tagline &amp; features. The button, badge and enable status stay controlled in Settings.</p>
            <PlanEditor name="pricing_plans" initial={pricingPlans} />
          </div>

          {/* Boost add-on */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">🚀</div>
              <h2 className="font-extrabold text-[#1C1C1E]">Pricing page — Boost add-on</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Title</Label>
                <Input name="boost_title" defaultValue={val("boost_title")} className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Price</Label>
                <Input name="boost_price" defaultValue={val("boost_price")} className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Period</Label>
                <Input name="boost_period" defaultValue={val("boost_period")} className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Description</Label>
              <Textarea name="boost_desc" rows={2} defaultValue={val("boost_desc")} className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Features <span className="text-[#9CA3AF] font-normal">(one per line)</span></Label>
              <Textarea name="boost_features" rows={4} defaultValue={val("boost_features")} className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-y" />
            </div>
          </div>

          <Button type="submit"
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] h-11 shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
            Save all content
          </Button>
        </form>

      </main>
    </div>
  )
}
