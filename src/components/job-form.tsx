"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MALAYSIA_LOCATIONS } from "@/data/malaysia-locations"

type JobFormProps = {
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    title?: string
    location?: string
    description?: string
    workType?: string
    payType?: string
    payRangeFrom?: number
    payRangeTo?: number
    sellingPoint1?: string
    sellingPoint2?: string
    sellingPoint3?: string
    requiresExp?: boolean
    yearsExpFrom?: number | null
    yearsExpTo?: number | null
    benefits?: string | null
    questions?: string | null
    hideCompanyInfo?: boolean
  }
  submitLabel?: string
}

export default function JobForm({ action, defaultValues: d = {}, submitLabel = "Post Job" }: JobFormProps) {
  const [requiresExp, setRequiresExp] = useState(d.requiresExp ?? false)

  return (
    <form action={action} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-[13.5px] font-semibold text-[#3A3A3C]">Job title *</Label>
        <Input id="title" name="title" required placeholder="e.g. Senior Backend Developer" defaultValue={d.title}
          className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-[13.5px] font-semibold text-[#3A3A3C]">Location *</Label>
          <select id="location" name="location" required defaultValue={d.location ?? ""}
            className="w-full border border-[#E6E2D9] rounded-[11px] px-3 py-2 text-sm bg-white text-[#1C1C1E] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]/20">
            <option value="" disabled>Select location</option>
            {MALAYSIA_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Work type */}
        <div className="space-y-1.5">
          <Label htmlFor="workType" className="text-[13.5px] font-semibold text-[#3A3A3C]">Work type *</Label>
          <select id="workType" name="workType" required defaultValue={d.workType ?? "ONSITE"}
            className="w-full border border-[#E6E2D9] rounded-[11px] px-3 py-2 text-sm bg-white text-[#1C1C1E] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]/20">
            <option value="ONSITE">On-site</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        {/* Pay type */}
        <div className="space-y-1.5">
          <Label htmlFor="payType" className="text-[13.5px] font-semibold text-[#3A3A3C]">Pay type</Label>
          <select id="payType" name="payType" defaultValue={d.payType ?? "MONTHLY"}
            className="w-full border border-[#E6E2D9] rounded-[11px] px-3 py-2 text-sm bg-white text-[#1C1C1E] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]/20">
            <option value="MONTHLY">Monthly</option>
            <option value="HOURLY">Hourly</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>

        {/* Pay range */}
        <div className="space-y-1.5">
          <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">Pay range (RM) *</Label>
          <div className="flex items-center gap-2">
            <Input name="payRangeFrom" type="number" required placeholder="From" defaultValue={d.payRangeFrom}
              className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
            <span className="text-[#9CA3AF] text-sm shrink-0">–</span>
            <Input name="payRangeTo" type="number" required placeholder="To" defaultValue={d.payRangeTo}
              className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
          </div>
        </div>
      </div>

      {/* Years of experience */}
      <div className="space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="requiresExp"
            checked={requiresExp}
            onChange={(e) => setRequiresExp(e.target.checked)}
            className="w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer"
          />
          <span className="text-[13.5px] font-semibold text-[#3A3A3C]">Years of experience required</span>
        </label>
        {requiresExp && (
          <div className="flex items-center gap-3 pl-6">
            <div className="flex items-center gap-2">
              <Input name="yearsExpFrom" type="number" min={0} max={30} placeholder="From" defaultValue={d.yearsExpFrom ?? ""}
                className="w-24 rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              <span className="text-[#9CA3AF] text-sm">to</span>
              <Input name="yearsExpTo" type="number" min={0} max={30} placeholder="To" defaultValue={d.yearsExpTo ?? ""}
                className="w-24 rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
              <span className="text-[13px] text-[#9CA3AF]">years</span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-[13.5px] font-semibold text-[#3A3A3C]">Job description *</Label>
        <Textarea id="description" name="description" required rows={6}
          placeholder="Responsibilities, requirements, tech stack, etc." defaultValue={d.description}
          className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
      </div>

      {/* Selling points */}
      <div className="space-y-2">
        <Label className="text-[13.5px] font-semibold text-[#3A3A3C]">3 key selling points *</Label>
        <Input name="sellingPoint1" required placeholder="e.g. Flexible working hours" defaultValue={d.sellingPoint1}
          className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        <Input name="sellingPoint2" required placeholder="e.g. Competitive salary" defaultValue={d.sellingPoint2}
          className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
        <Input name="sellingPoint3" required placeholder="e.g. Medical & dental benefits" defaultValue={d.sellingPoint3}
          className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316]" />
      </div>

      {/* Benefits */}
      <div className="space-y-1.5">
        <Label htmlFor="benefits" className="text-[13.5px] font-semibold text-[#3A3A3C]">
          Job benefits <span className="text-[#9CA3AF] font-normal">(optional)</span>
        </Label>
        <Textarea id="benefits" name="benefits" rows={3}
          placeholder="e.g. Annual leave 18 days, EPF + SOCSO, medical insurance, team retreats…"
          defaultValue={d.benefits ?? ""}
          className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
      </div>

      {/* Employer questions */}
      <div className="space-y-1.5">
        <Label htmlFor="questions" className="text-[13.5px] font-semibold text-[#3A3A3C]">
          Employer questions <span className="text-[#9CA3AF] font-normal">(optional)</span>
        </Label>
        <p className="text-[12.5px] text-[#9CA3AF]">Applicants will answer these when they submit their resume.</p>
        <Textarea id="questions" name="questions" rows={4}
          placeholder={"e.g.\n1. What is your current notice period?\n2. Are you comfortable with occasional travel?"}
          defaultValue={d.questions ?? ""}
          className="rounded-[11px] border-[#E6E2D9] focus:border-[#F97316] resize-none" />
      </div>

      {/* Hide company */}
      <div className="flex items-start gap-2.5">
        <input id="hideCompanyInfo" name="hideCompanyInfo" type="checkbox" defaultChecked={d.hideCompanyInfo}
          className="mt-0.5 w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer" />
        <Label htmlFor="hideCompanyInfo" className="font-normal text-[13.5px] text-[#6B7280] cursor-pointer">
          Hide company name and branding on this listing
        </Label>
      </div>

      <Button type="submit"
        className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] h-11 shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
        {submitLabel}
      </Button>
    </form>
  )
}
