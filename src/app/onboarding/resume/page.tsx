"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveResumeUrl } from "@/app/actions/onboarding"
import { createResumeUploadUrl } from "@/app/actions/resume"
import { supabase } from "@/lib/supabase"

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [agreedShare, setAgreedShare] = useState(false)
  const [joinPool, setJoinPool] = useState(true) // Standard by default (visible + uncheckable)
  const router = useRouter()

  async function finishOnboarding() {
    // Mark onboarding complete even when skipping (sets onboardedAt so it won't re-prompt).
    setUploading(true)
    await saveResumeUrl("")
    router.push("/onboarding/complete")
  }

  async function handleUpload() {
    if (!file) return finishOnboarding()
    if (!agreedShare) { setError("Please agree to share your resume with companies to upload."); return }
    setUploading(true)
    setError("")
    const ext = file.name.split(".").pop() ?? "pdf"
    const signed = await createResumeUploadUrl(ext)
    if ("error" in signed) { setError(signed.error); setUploading(false); return }
    const { error: uploadError } = await supabase.storage.from("resumes").uploadToSignedUrl(signed.path, signed.token, file)
    if (uploadError) { setError("Upload failed. Please try again."); setUploading(false); return }
    await saveResumeUrl(signed.path, undefined, joinPool)
    router.push("/onboarding/complete")
  }

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg,#FFF7ED 0%,#FFFBF5 100%)" }}>
      <div className="filter blur-sm pointer-events-none select-none opacity-60 p-8">
        <div className="max-w-4xl mx-auto text-center py-12 space-y-3">
          <h1 className="text-4xl font-extrabold text-[#1C1C1E]">Find your next role <span className="text-[#F97316]">in tech</span></h1>
          <p className="text-[#6B7280]">The job board built only for Malaysian IT professionals.</p>
        </div>
      </div>

      <div className="absolute inset-0 bg-[#1C1C1E]/50 backdrop-blur-[2px] flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] bg-white rounded-[20px] p-8 shadow-[0_30px_70px_rgba(28,28,30,.3)]">
          <div className="text-center mb-5">
            <h2 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mb-1.5">Upload your resume</h2>
            <p className="text-[14px] text-[#9CA3AF]">PDF or Word document, max 5MB</p>
          </div>

          {/* Encouragement highlight */}
          <div className="flex items-start gap-2.5 bg-[#FFF7ED] border border-[#FBDDBE] rounded-[12px] px-3.5 py-3 mb-5">
            <span className="text-base leading-none mt-0.5">💡</span>
            <p className="text-[12.5px] text-[#92400E] leading-relaxed">
              <strong>Stand out to employers.</strong> Candidates who upload a resume are reviewed first and contacted faster. It only takes a minute — but you can skip and add it later.
            </p>
          </div>

          <label className="block mb-5 cursor-pointer">
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <div className="border-2 border-dashed border-[#F7C99A] rounded-[14px] bg-[#FFFBF5] p-8 text-center hover:border-[#F97316] transition-colors">
              <div className="w-[46px] h-[46px] rounded-[13px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-xl mx-auto mb-3">↑</div>
              <p className="text-[15px] font-bold text-[#1C1C1E]">Click to select file</p>
              <p className="text-[12.5px] text-[#B6B2A8] mt-1">PDF, DOC, DOCX</p>
            </div>
          </label>

          {file && (
            <div className="flex items-center gap-3 bg-[#F6F4EE] rounded-[11px] px-3.5 py-3 mb-4">
              <div className="w-8 h-8 rounded-[8px] bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-[11px] font-bold shrink-0">PDF</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-[#1C1C1E] truncate">{file.name}</p>
                <p className="text-[11.5px] text-[#9CA3AF]">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="text-[13px] font-bold text-[#DC2626] shrink-0">Remove</button>
            </div>
          )}

          {/* Share consent — only relevant when a file is chosen */}
          {file && (
            <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
              <input type="checkbox" checked={agreedShare} onChange={(e) => setAgreedShare(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 shrink-0" />
              <span className="text-[12.5px] text-[#6B7280] leading-relaxed">
                I agree to share my resume with companies I apply to, in line with the{" "}
                <a href="/privacy" target="_blank" className="font-semibold text-[#F97316] hover:text-[#EA580C]">Privacy Policy</a>.
              </span>
            </label>
          )}

          {/* Talent Pool — separate, optional consent (not required to upload) */}
          {file && (
            <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
              <input type="checkbox" checked={joinPool} onChange={(e) => setJoinPool(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#D1C9BB] text-[#F97316] focus:ring-[#F97316]/30 shrink-0" />
              <span className="text-[12.5px] text-[#6B7280] leading-relaxed">
                Let verified subscribing employers discover &amp; unlock my resume in the Talent Pool, so they can reach out even before I apply. <strong className="text-[#3A3A3C]">On by default</strong> — untick to keep your resume visible only to jobs you apply to. You can change this anytime in your profile.
              </span>
            </label>
          )}

          {error && <p className="text-sm text-[#DC2626] font-medium mb-3">{error}</p>}

          <button onClick={handleUpload} disabled={uploading}
            className="w-full py-3.5 rounded-[12px] text-[15px] font-bold bg-[#1C1C1E] hover:bg-[#2A2A2E] text-white transition-colors mb-4">
            {uploading ? "Uploading…" : file ? "Upload & continue" : "Continue without resume"}
          </button>

          <div className="flex items-center justify-center gap-6">
            <button type="button" onClick={() => router.back()}
              className="text-[14px] font-semibold text-[#9CA3AF] hover:text-[#6B7280]">← Back</button>
            <button type="button" onClick={finishOnboarding} disabled={uploading}
              className="text-[14px] font-semibold text-[#9CA3AF] hover:text-[#6B7280]">Skip for now</button>
          </div>
        </div>
      </div>
    </div>
  )
}
