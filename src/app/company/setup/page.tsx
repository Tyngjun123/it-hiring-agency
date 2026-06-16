"use client"

import { useState } from "react"
import { setupCompanyProfile } from "@/app/actions/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useActionState } from "react"

export default function CompanySetupPage() {
  return <CompanySetupForm />
}

function CompanySetupForm() {
  const [isSelfEmployed, setIsSelfEmployed] = useState(false)
  const [state, action, pending] = useActionState(setupCompanyProfile, null)

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-start justify-center py-14 px-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-[10px] bg-[#F97316] flex items-center justify-center shadow-[0_4px_11px_rgba(249,115,22,0.35)]">
            <span className="text-white font-mono font-bold text-sm leading-none">&gt;_</span>
          </div>
          <span className="text-[21px] font-extrabold text-[#1C1C1E] tracking-tight">IT Hire</span>
        </div>

        <div className="bg-white border border-[#EEEBE3] rounded-2xl p-8 shadow-[0_1px_2px_rgba(28,28,30,.03),0_12px_30px_rgba(28,28,30,.06)]">
          <h1 className="text-[26px] font-extrabold text-[#1C1C1E] tracking-tight mb-1">Set up your company</h1>
          <p className="text-[14.5px] text-[#9CA3AF] mb-7">This info appears on your job listings and company profile.</p>

          {state?.error && (
            <div className="mb-5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm text-[#DC2626] font-medium">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-[13.5px] font-semibold text-[#3A3A3C]">Company name *</Label>
              <Input id="companyName" name="companyName" required placeholder="Acme Sdn Bhd"
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] focus:ring-[#F97316]/20" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="text-[13.5px] font-semibold text-[#3A3A3C]">Contact email *</Label>
              <Input id="contactEmail" name="contactEmail" type="email" required placeholder="hr@yourcompany.com"
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] focus:ring-[#F97316]/20" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ssm" className="text-[13.5px] font-semibold text-[#3A3A3C]">SSM Registration No. <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
              <Input id="ssm" name="ssm" placeholder="1234567-A"
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] focus:ring-[#F97316]/20" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="linkedinUrl" className="text-[13.5px] font-semibold text-[#3A3A3C]">LinkedIn <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
              <Input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/company/..."
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] focus:ring-[#F97316]/20" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-[13.5px] font-semibold text-[#3A3A3C]">Website <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
              <Input id="website" name="website" type="url" placeholder="https://yourcompany.com"
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] focus:ring-[#F97316]/20" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[13.5px] font-semibold text-[#3A3A3C]">About the company <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
              <Textarea id="description" name="description" rows={3} placeholder="What does your company do?"
                className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] focus:ring-[#F97316]/20 resize-none" />
            </div>

            {/* Self-employed checkbox */}
            <div className="pt-1 border-t border-[#F4F1EA]">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isSelfEmployed"
                  checked={isSelfEmployed}
                  onChange={(e) => setIsSelfEmployed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer"
                />
                <div>
                  <p className="text-[14px] font-semibold text-[#1C1C1E]">I&apos;m self-employed, planning to hire part-time</p>
                  <p className="text-[12.5px] text-[#9CA3AF] mt-0.5">We&apos;ll show your personal info and WhatsApp on listings instead of a company profile.</p>
                </div>
              </label>
            </div>

            {isSelfEmployed && (
              <div className="bg-[#FFF7ED] border border-[#FBDDBE] rounded-[14px] p-5 space-y-4">
                <p className="text-[13px] font-bold text-[#C2410C] uppercase tracking-[.04em]">Personal details</p>
                <div className="space-y-1.5">
                  <Label htmlFor="personalName" className="text-[13.5px] font-semibold text-[#3A3A3C]">Your name</Label>
                  <Input id="personalName" name="personalName" placeholder="Your full name"
                    className="rounded-[11px] border-[#F7C99A] focus:border-[#F97316] bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="whatsappNumber" className="text-[13.5px] font-semibold text-[#3A3A3C]">WhatsApp number</Label>
                  <Input id="whatsappNumber" name="whatsappNumber" type="tel" placeholder="+60 12-345 6789"
                    className="rounded-[11px] border-[#F7C99A] focus:border-[#F97316] bg-white" />
                </div>
              </div>
            )}

            <Button type="submit" disabled={pending}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] h-11 shadow-[0_6px_15px_rgba(249,115,22,0.3)] transition-colors mt-2">
              {pending ? "Saving…" : "Save & continue →"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
