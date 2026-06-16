"use client"

import { useState } from "react"
import { useActionState } from "react"
import { setupCompanyProfile } from "@/app/actions/company"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  defaultValues: {
    companyName: string
    contactEmail: string
    ssm: string
    linkedinUrl: string
    website: string
    description: string
    isSelfEmployed: boolean
    whatsappNumber: string
  }
}

export default function CompanySetupForm({ defaultValues: d }: Props) {
  const [isSelfEmployed, setIsSelfEmployed] = useState(d.isSelfEmployed)
  const [state, action, pending] = useActionState(setupCompanyProfile, null)

  return (
    <div className="bg-white border border-[#EEEBE3] rounded-2xl p-7 shadow-[0_1px_2px_rgba(28,28,30,.03),0_6px_16px_rgba(28,28,30,.04)]">
      {state?.error && (
        <div className="mb-5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 text-sm text-[#DC2626] font-medium">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="companyName" className="text-[13.5px] font-semibold text-[#3A3A3C]">Company name *</Label>
          <Input id="companyName" name="companyName" required placeholder="Acme Sdn Bhd" defaultValue={d.companyName}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactEmail" className="text-[13.5px] font-semibold text-[#3A3A3C]">Contact email *</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required placeholder="hr@yourcompany.com" defaultValue={d.contactEmail}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ssm" className="text-[13.5px] font-semibold text-[#3A3A3C]">SSM Registration No. <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
          <Input id="ssm" name="ssm" placeholder="1234567-A" defaultValue={d.ssm}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="linkedinUrl" className="text-[13.5px] font-semibold text-[#3A3A3C]">LinkedIn <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
          <Input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/company/..." defaultValue={d.linkedinUrl}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website" className="text-[13.5px] font-semibold text-[#3A3A3C]">Website <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
          <Input id="website" name="website" type="url" placeholder="https://yourcompany.com" defaultValue={d.website}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-[13.5px] font-semibold text-[#3A3A3C]">About the company <span className="text-[#9CA3AF] font-normal">(optional)</span></Label>
          <Textarea id="description" name="description" rows={3} placeholder="What does your company do?" defaultValue={d.description}
            className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
        </div>

        {/* Self-employed checkbox */}
        <div className="pt-1 border-t border-[#F4F1EA]">
          <label className="flex items-start gap-3 cursor-pointer">
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
              <Input id="whatsappNumber" name="whatsappNumber" type="tel" placeholder="+60 12-345 6789" defaultValue={d.whatsappNumber}
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
  )
}
