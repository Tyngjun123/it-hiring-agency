"use client"

import { toast } from "sonner"
import { getResumeViewUrl } from "@/app/actions/resume"

// Opens a private résumé in a new tab via a short-lived signed URL.
export default function ResumeOpenLink({
  stored,
  className,
  children,
}: {
  stored: string
  className?: string
  children: React.ReactNode
}) {
  async function open() {
    const res = await getResumeViewUrl(stored)
    if ("url" in res) window.open(res.url, "_blank", "noopener,noreferrer")
    else toast.error(res.error)
  }
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  )
}
