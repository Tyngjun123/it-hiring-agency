export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { DEFAULT_TEMPLATES } from "@/lib/email-templates"
import { saveEmailTemplate } from "@/app/actions/cms"

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error } = await searchParams
  const overrides = await prisma.emailTemplate.findMany()
  const overrideMap = new Map(overrides.map((o) => [o.key, o]))

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div>
          <Link href="/admin" className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            ← Admin panel
          </Link>
          <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mt-2">Email Content</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            Edit the wording of notification emails. The layout & footer stay fixed.
          </p>
        </div>

        {saved === "1" && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm font-semibold text-[#047857]">Saved.</div>
        )}
        {error === "1" && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm font-semibold text-[#DC2626]">Subject and body are required.</div>
        )}

        <div className="space-y-5">
          {DEFAULT_TEMPLATES.map((tpl) => {
            const o = overrideMap.get(tpl.key)
            const subject = o?.subject ?? tpl.subject
            const body = o?.body ?? tpl.body
            return (
              <div key={tpl.key} className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-[15px] font-bold text-[#1C1C1E]">{tpl.name}</h2>
                  {o
                    ? <span className="text-[11px] font-bold bg-[#FFF7ED] text-[#F97316] px-2.5 py-0.5 rounded-full border border-[#FBDDBE]">Customised</span>
                    : <span className="text-[11px] font-bold bg-[#F4F1EA] text-[#9CA3AF] px-2.5 py-0.5 rounded-full">Default</span>}
                </div>

                <form action={saveEmailTemplate} className="space-y-3">
                  <input type="hidden" name="key" value={tpl.key} />
                  <input type="hidden" name="name" value={tpl.name} />

                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Subject</label>
                    <input name="subject" defaultValue={subject}
                      className="w-full border border-[#E6E2D9] rounded-[10px] px-3 py-2 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#F97316]" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Body (HTML)</label>
                    <textarea name="body" rows={6} defaultValue={body}
                      className="w-full border border-[#E6E2D9] rounded-[10px] px-3 py-2 text-[13px] font-mono text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-y" />
                  </div>

                  <p className="text-[12px] text-[#9CA3AF]">
                    Placeholders: {tpl.placeholders.map((p) => (
                      <code key={p} className="bg-[#F4F1EA] text-[#C2410C] px-1.5 py-0.5 rounded mr-1">{`{{${p}}}`}</code>
                    ))}
                  </p>

                  <button type="submit"
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-4 py-2 rounded-[9px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
                    Save
                  </button>
                </form>
              </div>
            )
          })}
        </div>

      </main>
    </div>
  )
}
