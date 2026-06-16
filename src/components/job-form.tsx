"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
    hideCompanyInfo?: boolean
  }
  submitLabel?: string
}

export default function JobForm({ action, defaultValues: d = {}, submitLabel = "Post Job" }: JobFormProps) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="title">Job title *</Label>
          <Input id="title" name="title" required placeholder="e.g. Senior Backend Developer" defaultValue={d.title} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="location">Location *</Label>
          <Input id="location" name="location" required placeholder="e.g. Kuala Lumpur" defaultValue={d.location} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="workType">Work type *</Label>
          <select id="workType" name="workType" required defaultValue={d.workType ?? "ONSITE"}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
            <option value="ONSITE">On-site</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="payType">Pay type</Label>
          <select id="payType" name="payType" defaultValue={d.payType ?? "MONTHLY"}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
            <option value="MONTHLY">Monthly</option>
            <option value="HOURLY">Hourly</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label>Pay range (RM) *</Label>
          <div className="flex items-center gap-2">
            <Input name="payRangeFrom" type="number" required placeholder="From" defaultValue={d.payRangeFrom} />
            <span className="text-gray-400 text-sm">–</span>
            <Input name="payRangeTo" type="number" required placeholder="To" defaultValue={d.payRangeTo} />
          </div>
        </div>

        <div className="col-span-2 space-y-1">
          <Label htmlFor="description">Job description *</Label>
          <Textarea id="description" name="description" required rows={6} placeholder="Responsibilities, requirements, etc." defaultValue={d.description} />
        </div>

        <div className="col-span-2 space-y-2">
          <Label>3 Key selling points *</Label>
          <Input name="sellingPoint1" required placeholder="e.g. Flexible working hours" defaultValue={d.sellingPoint1} />
          <Input name="sellingPoint2" required placeholder="e.g. Competitive salary" defaultValue={d.sellingPoint2} />
          <Input name="sellingPoint3" required placeholder="e.g. Medical & dental benefits" defaultValue={d.sellingPoint3} />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input id="hideCompanyInfo" name="hideCompanyInfo" type="checkbox" defaultChecked={d.hideCompanyInfo}
            className="w-4 h-4 rounded border-gray-300" />
          <Label htmlFor="hideCompanyInfo" className="font-normal text-gray-600">
            Hide company name and branding on job listing
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  )
}
