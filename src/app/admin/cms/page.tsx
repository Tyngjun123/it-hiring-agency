export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { saveCmsContent } from "@/app/actions/cms"

const DEFAULTS: Record<string, string> = {
  contact_email: "support@stacktalentx.com",
  contact_whatsapp: "https://wa.me/60123456789",
  contact_whatsapp_label: "Chat on WhatsApp →",
  contact_hours: "Mon–Fri, 9am–6pm MYT",
  contact_address: "Level 12, Menara Tech\nJalan Sultan Ismail, 50250\nKuala Lumpur, Malaysia",
  meta_contact_title: "Contact StackTalentx | Malaysia's IT Job Platform",
  meta_contact_desc: "Get in touch with the StackTalentx team for job posting, billing or partnership enquiries.",
  about_tagline: "The IT job board built for Malaysia",
  about_hero: "We connect Malaysia's best tech talent with the companies building the future.",
  about_body: "<p>StackTalentx was founded in 2024 with a simple mission: make it easier for Malaysian IT professionals to find great jobs — and for companies to hire them.</p>",
  meta_about_title: "About StackTalentx | Malaysia's IT Job Platform",
  meta_about_desc: "Learn about StackTalentx — the job board built specifically for Malaysian IT professionals and the companies hiring them.",
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

        <form action={saveCmsContent} className="space-y-6">

          {/* Contact page */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">✉</div>
              <h2 className="font-extrabold text-[#1C1C1E]">Contact page</h2>
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
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Office address</Label>
              <Textarea name="contact_address" rows={3} defaultValue={val("contact_address")}
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
              <h2 className="font-extrabold text-[#1C1C1E]">About us page</h2>
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

          <Button type="submit"
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] h-11 shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
            Save all content
          </Button>
        </form>

      </main>
    </div>
  )
}
