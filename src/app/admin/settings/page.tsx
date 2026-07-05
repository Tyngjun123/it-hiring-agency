export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { saveSiteSettings, toggleMaintenanceMode, toggleMaxPlan, toggleProPlan } from "@/app/actions/cms"

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; maintenance?: string; maxplan?: string; proplan?: string }>
}) {
  const { saved, maintenance, maxplan, proplan } = await searchParams
  const config = await prisma.siteConfig.findUnique({ where: { id: "singleton" } })
  const isMaintenanceOn = config?.maintenanceMode ?? false
  const isMaxPlanOn = config?.maxPlanEnabled ?? false
  const isProPlanOn = config?.proPlanEnabled ?? false

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              ← Admin panel
            </Link>
            <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mt-2">Site Settings</h1>
            <p className="text-sm text-[#9CA3AF]">Logo, social links, contact info &amp; maintenance mode</p>
          </div>
        </div>

        {(saved === "1") && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm text-[#047857] font-medium">
            Settings saved successfully.
          </div>
        )}
        {maintenance === "on" && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm text-[#DC2626] font-medium">
            Maintenance mode is now ON. All visitors will see the maintenance page.
          </div>
        )}
        {maintenance === "off" && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm text-[#047857] font-medium">
            Maintenance mode is now OFF. The site is live.
          </div>
        )}
        {maxplan === "on" && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm text-[#047857] font-medium">
            Max plan is now LIVE — companies can purchase it. Pricing &amp; billing pages show the upgrade button.
          </div>
        )}
        {maxplan === "off" && (
          <div className="bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl px-4 py-3 text-sm text-[#C2410C] font-medium">
            Max plan is now hidden — public sees &ldquo;Coming soon&rdquo;. The backend stays ready.
          </div>
        )}
        {proplan === "on" && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm text-[#047857] font-medium">
            Pro plan is now LIVE — companies can purchase it (RM200). Pricing &amp; billing show the upgrade button.
          </div>
        )}
        {proplan === "off" && (
          <div className="bg-[#FFF7ED] border border-[#FBDDBE] rounded-xl px-4 py-3 text-sm text-[#C2410C] font-medium">
            Pro plan is now hidden — public sees &ldquo;Coming soon&rdquo;. The backend stays ready.
          </div>
        )}

        {/* Maintenance Mode — separate card, prominent */}
        <div className={`rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] border ${
          isMaintenanceOn
            ? "bg-[#FEF2F2] border-[#FECACA]"
            : "bg-white border-[#EEEBE3]"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center text-sm font-bold ${
                  isMaintenanceOn ? "bg-[#FEE2E2] text-[#DC2626]" : "bg-[#FFF7ED] text-[#F97316]"
                }`}>
                  {isMaintenanceOn ? "!" : "🔧"}
                </div>
                <h2 className="font-extrabold text-[#1C1C1E]">Maintenance Mode</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isMaintenanceOn
                    ? "bg-[#FEE2E2] text-[#DC2626]"
                    : "bg-[#ECFDF5] text-[#16A34A]"
                }`}>
                  {isMaintenanceOn ? "ON" : "OFF"}
                </span>
              </div>
              <p className="text-sm text-[#6B7280]">
                {isMaintenanceOn
                  ? "Site is offline for visitors. Only admins can access all pages."
                  : "Site is live. Toggle ON to show a maintenance page to all visitors."}
              </p>
            </div>
            <form action={async () => {
              "use server"
              await toggleMaintenanceMode(!isMaintenanceOn)
            }}>
              <button type="submit"
                className={`shrink-0 px-5 py-2.5 rounded-[11px] text-sm font-bold transition-colors ${
                  isMaintenanceOn
                    ? "bg-[#16A34A] hover:bg-[#15803D] text-white shadow-[0_4px_10px_rgba(22,163,74,0.3)]"
                    : "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-[0_4px_10px_rgba(220,38,38,0.3)]"
                }`}>
                {isMaintenanceOn ? "Disable — Go Live" : "Enable Maintenance"}
              </button>
            </form>
          </div>
        </div>

        {/* Max Plan availability — backend is built; this flips public access */}
        <div className={`rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] border ${
          isMaxPlanOn ? "bg-[#ECFDF5] border-[#A7F3D0]" : "bg-white border-[#EEEBE3]"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">🚀</div>
                <h2 className="font-extrabold text-[#1C1C1E]">Max Plan (public)</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isMaxPlanOn ? "bg-[#ECFDF5] text-[#16A34A]" : "bg-[#F4F2EC] text-[#9CA3AF]"
                }`}>
                  {isMaxPlanOn ? "LIVE" : "COMING SOON"}
                </span>
              </div>
              <p className="text-sm text-[#6B7280]">
                {isMaxPlanOn
                  ? "Companies can purchase the RM400 Max plan. Pricing & billing show a live upgrade button."
                  : "Max backend is ready, but the public sees a disabled “Coming soon” button. You can still assign Max manually to any company under Companies."}
              </p>
            </div>
            <form action={async () => {
              "use server"
              await toggleMaxPlan(!isMaxPlanOn)
            }}>
              <button type="submit"
                className={`shrink-0 px-5 py-2.5 rounded-[11px] text-sm font-bold transition-colors ${
                  isMaxPlanOn
                    ? "bg-[#9CA3AF] hover:bg-[#6B7280] text-white"
                    : "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[0_4px_10px_rgba(249,115,22,0.3)]"
                }`}>
                {isMaxPlanOn ? "Hide — Coming soon" : "Make Max live"}
              </button>
            </form>
          </div>
        </div>

        {/* Pro Plan availability — backend is built; this flips public access */}
        <div className={`rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] border ${
          isProPlanOn ? "bg-[#ECFDF5] border-[#A7F3D0]" : "bg-white border-[#EEEBE3]"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">💳</div>
                <h2 className="font-extrabold text-[#1C1C1E]">Pro Plan (public)</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isProPlanOn ? "bg-[#ECFDF5] text-[#16A34A]" : "bg-[#F4F2EC] text-[#9CA3AF]"
                }`}>
                  {isProPlanOn ? "LIVE" : "COMING SOON"}
                </span>
              </div>
              <p className="text-sm text-[#6B7280]">
                {isProPlanOn
                  ? "Companies can purchase the RM200 Pro plan. Pricing & billing show a live upgrade button."
                  : "Pro backend is ready, but the public sees a disabled “Coming soon” button. You can still assign Pro manually to any company under Companies."}
              </p>
            </div>
            <form action={async () => {
              "use server"
              await toggleProPlan(!isProPlanOn)
            }}>
              <button type="submit"
                className={`shrink-0 px-5 py-2.5 rounded-[11px] text-sm font-bold transition-colors ${
                  isProPlanOn
                    ? "bg-[#9CA3AF] hover:bg-[#6B7280] text-white"
                    : "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[0_4px_10px_rgba(249,115,22,0.3)]"
                }`}>
                {isProPlanOn ? "Hide — Coming soon" : "Make Pro live"}
              </button>
            </form>
          </div>
        </div>

        {/* Main settings form */}
        <form action={saveSiteSettings} className="space-y-6">

          {/* Logo */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">🖼</div>
              <h2 className="font-extrabold text-[#1C1C1E]">Logo</h2>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Logo image URL</Label>
              <Input name="logoUrl" type="url" placeholder="https://..." defaultValue={config?.logoUrl ?? ""}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              <p className="text-[12px] text-[#9CA3AF]">
                Upload your image to Supabase Storage or any image host, then paste the URL here. Recommended: 200×200px PNG.
              </p>
            </div>
            {config?.logoUrl && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.logoUrl} alt="Logo preview" className="w-12 h-12 rounded-[11px] object-contain border border-[#EEEBE3]" />
                <span className="text-xs text-[#9CA3AF]">Current logo</span>
              </div>
            )}
          </div>

          {/* Social Media Links */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">📱</div>
              <h2 className="font-extrabold text-[#1C1C1E]">Social Media Links</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { name: "facebookUrl", label: "Facebook", placeholder: "https://www.facebook.com/stacktalentx", value: config?.facebookUrl ?? "" },
                { name: "instagramUrl", label: "Instagram", placeholder: "https://www.instagram.com/stacktalentx", value: config?.instagramUrl ?? "" },
                { name: "linkedinUrl", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/stacktalentx", value: config?.linkedinUrl ?? "" },
                { name: "twitterUrl", label: "Twitter / X", placeholder: "https://twitter.com/stacktalentx", value: config?.twitterUrl ?? "" },
              ].map(({ name, label, placeholder, value }) => (
                <div key={name} className="space-y-1.5">
                  <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">{label}</Label>
                  <Input name={name} type="url" placeholder={placeholder} defaultValue={value}
                    className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)] space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-sm font-bold">📞</div>
              <h2 className="font-extrabold text-[#1C1C1E]">Contact Info</h2>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Phone number</Label>
              <Input name="contactPhone" placeholder="+60 12-345 6789" defaultValue={config?.contactPhone ?? ""}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Contact email</Label>
              <Input name="contactEmail" type="email" placeholder="support@stacktalentx.com" defaultValue={config?.contactEmail ?? ""}
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            </div>
          </div>

          <Button type="submit"
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] h-11 shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
            Save settings
          </Button>
        </form>

      </main>
    </div>
  )
}
