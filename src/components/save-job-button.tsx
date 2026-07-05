"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { toggleSaveJob } from "@/app/actions/jobs"

function Bookmark({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}

export default function SaveJobButton({
  jobId,
  initialSaved,
  variant = "icon",
}: {
  jobId: string
  initialSaved: boolean
  variant?: "icon" | "labeled"
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, start] = useTransition()

  function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    const next = !saved
    setSaved(next) // optimistic
    start(async () => {
      const res = await toggleSaveJob(jobId)
      if ("error" in res) {
        setSaved(!next)
        toast.error(res.error)
      } else {
        setSaved(res.saved)
        toast.success(res.saved ? "Saved to your list" : "Removed from saved")
      }
    })
  }

  if (variant === "labeled") {
    return (
      <button type="button" onClick={toggle} disabled={pending}
        aria-pressed={saved}
        className={`inline-flex items-center justify-center gap-2 w-full font-bold text-[14px] py-3 rounded-[12px] border transition-colors disabled:opacity-60 ${
          saved
            ? "border-[#F97316] text-[#F97316] bg-[#FFF7ED]"
            : "border-[#E6E2D9] text-[#3A3A3C] hover:border-[#F97316] hover:text-[#F97316]"
        }`}>
        <Bookmark filled={saved} />
        {saved ? "Saved" : "Save job"}
      </button>
    )
  }

  return (
    <button type="button" onClick={toggle} disabled={pending}
      aria-label={saved ? "Remove from saved" : "Save job"} aria-pressed={saved}
      title={saved ? "Saved — click to remove" : "Save job"}
      className={`flex items-center justify-center transition-colors disabled:opacity-60 ${
        saved ? "text-[#F97316]" : "text-[#9CA3AF] hover:text-[#F97316]"
      }`}>
      <Bookmark filled={saved} />
    </button>
  )
}
