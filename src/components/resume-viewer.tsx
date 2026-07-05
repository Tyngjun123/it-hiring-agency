"use client"

import { useState } from "react"
import { toast } from "sonner"
import { getResumeViewUrl } from "@/app/actions/resume"

export default function ResumeViewer({ stored }: { stored: string }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function ensureUrl(): Promise<string | null> {
    if (url) return url
    setLoading(true)
    const res = await getResumeViewUrl(stored)
    setLoading(false)
    if ("url" in res) { setUrl(res.url); return res.url }
    toast.error(res.error)
    return null
  }

  async function toggle() {
    if (!open) {
      const u = await ensureUrl()
      if (u) setOpen(true)
    } else {
      setOpen(false)
    }
  }

  async function openTab() {
    const u = await ensureUrl()
    if (u) window.open(u, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-3">
        <button type="button" onClick={toggle} disabled={loading}
          className="text-sm font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors disabled:opacity-50">
          {loading ? "Loading…" : open ? "Hide resume ↑" : "View resume ↓"}
        </button>
        <button type="button" onClick={openTab}
          className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
          Open in new tab ↗
        </button>
      </div>

      {open && url && (
        <div className="mt-2 border border-[#EEEBE3] rounded-xl overflow-hidden shadow-sm">
          <iframe src={url} className="w-full h-[680px]" title="Applicant Resume" />
        </div>
      )}
    </div>
  )
}
