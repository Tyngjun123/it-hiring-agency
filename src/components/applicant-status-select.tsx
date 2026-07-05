"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updateApplicationStatus } from "@/app/actions/company"

type Status = "PENDING" | "SHORTLISTED" | "INTERVIEWING" | "SUCCESS" | "FAIL"

const OPTIONS: { value: Status; label: string }[] = [
  { value: "PENDING", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "SUCCESS", label: "Hired" },
  { value: "FAIL", label: "Not Selected" },
]

// Lets the company move an applicant through the pipeline — and change it back
// at any time (no longer a one-way Hired/Reject).
export default function ApplicantStatusSelect({
  applicationId,
  current,
}: {
  applicationId: string
  current: Status
}) {
  const [value, setValue] = useState<Status>(current)
  const [pending, start] = useTransition()

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as Status
        setValue(next)
        start(async () => {
          await updateApplicationStatus(applicationId, next)
          toast.success("Status updated")
        })
      }}
      className="text-[13px] font-semibold text-[#1C1C1E] bg-white border border-[#E6E2D9] rounded-[10px] pl-3 pr-7 py-2 focus:outline-none focus:border-[#F97316] cursor-pointer disabled:opacity-60"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
