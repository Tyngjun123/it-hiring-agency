"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { saveResumeUrl } from "@/app/actions/onboarding"
import { removeResume } from "@/app/actions/profile"
import { createResumeUploadUrl, getResumeViewUrl } from "@/app/actions/resume"
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll"

export default function ResumeSection({ resumeUrl }: { resumeUrl: string | null | undefined }) {
  // `stored` holds the private path (or a legacy public URL).
  const [stored, setStored] = useState(resumeUrl ?? null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewUrl, setViewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  useLockBodyScroll(viewOpen)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    const ext = file.name.split(".").pop() ?? "pdf"
    const signed = await createResumeUploadUrl(ext)
    if ("error" in signed) {
      setError(signed.error); setUploading(false); return
    }

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .uploadToSignedUrl(signed.path, signed.token, file)

    if (uploadError) {
      setError("Upload failed. Please try again.")
      setUploading(false)
      return
    }

    await saveResumeUrl(signed.path)
    setStored(signed.path)
    setUploading(false)
    toast.success("Resume uploaded")
    e.target.value = ""
  }

  async function handleRemove() {
    if (!window.confirm("Remove your resume? You can upload a new one anytime.")) return
    setUploading(true)
    await removeResume()
    setStored(null)
    setUploading(false)
    toast.success("Resume removed")
  }

  async function openViewer() {
    if (!stored) return
    setViewOpen(true)
    setViewUrl(null)
    const res = await getResumeViewUrl(stored)
    if ("url" in res) setViewUrl(res.url)
    else toast.error(res.error)
  }

  const isPdf = stored?.toLowerCase().includes(".pdf")

  return (
    <>
      {/* Drop zone / upload area */}
      <label
        className="block border-2 border-dashed border-[#F7C99A] bg-[#FFFBF5] rounded-xl p-6 text-center hover:border-[#F97316] transition-colors cursor-pointer"
        onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}
      >
        <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] flex items-center justify-center mx-auto mb-3 text-[#F97316] text-xl">
          {uploading ? "…" : "↑"}
        </div>
        <p className="text-sm font-bold text-[#1C1C1E]">
          {uploading ? "Uploading…" : <>Drop your CV here, or <span className="text-[#F97316]">browse</span></>}
        </p>
        <p className="text-xs text-[#9CA3AF] mt-1">PDF or DOCX, up to 5 MB</p>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {error && <p className="text-xs text-[#DC2626] mt-2">{error}</p>}

      {/* Existing resume row */}
      {stored && (
        <div className="flex items-center justify-between mt-3 bg-[#F6F4EE] rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[9px] bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-[10px] font-extrabold">
              {isPdf ? "PDF" : "DOC"}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C1C1E]">Resume</p>
              <p className="text-xs text-[#9CA3AF]">Uploaded</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={openViewer}
              className="text-xs font-bold text-[#F97316] hover:underline">View</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="text-xs font-bold text-[#6B7280] hover:underline disabled:opacity-50">
              {uploading ? "Working…" : "Replace"}
            </button>
            <button type="button" onClick={handleRemove} disabled={uploading}
              className="text-xs font-bold text-[#DC2626] hover:underline disabled:opacity-50">Remove</button>
          </div>
        </div>
      )}

      {/* PDF viewer modal */}
      {viewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setViewOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EEEBE3]">
              <p className="text-sm font-bold text-[#1C1C1E]">Resume</p>
              <div className="flex items-center gap-3">
                {viewUrl && (
                  <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#F97316] hover:underline">
                    Open in new tab ↗
                  </a>
                )}
                <button type="button" onClick={() => setViewOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F4F1EA] hover:bg-[#EEEBE3] text-[#3A3A3C] text-sm font-bold flex items-center justify-center transition-colors">✕</button>
              </div>
            </div>
            {!viewUrl ? (
              <div className="flex-1 flex items-center justify-center min-h-[40vh] text-[#9CA3AF] text-sm">Loading…</div>
            ) : isPdf ? (
              <iframe src={`${viewUrl}#toolbar=0`} className="flex-1 w-full min-h-[70vh]" title="Resume preview" />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                <p className="text-[15px] text-[#6B7280]">Preview not available for this file type.</p>
                <a href={viewUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold px-6 py-2.5 rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors">
                  Download file
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
