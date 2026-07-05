"use client"

import { useState } from "react"

const JOB_TYPE_LABEL: Record<string, string> = {
  PROJECT_COORDINATOR: "Project Coordinator",
  BUSINESS_ANALYST: "Business Analyst",
  QUALITY_ASSURANCE: "Quality Assurance",
  PROJECT_MANAGER: "Project Manager",
  APPLICATION_SYSTEM_SUPPORT: "Application / System Support",
  INFRASTRUCTURE: "Infrastructure",
  BACKEND_DEVELOPER: "Backend Developer",
  FRONTEND_DEVELOPER: "Frontend Developer",
  FULLSTACK_DEVELOPER: "Fullstack Developer",
  EXPLORING: "Exploring",
}

export type QuickResumeData = {
  name: string
  email: string
  phone?: string | null
  linkedinUrl?: string | null
  jobPreferences: { jobType: string }[]
  techSkills: { language: string; yearsExp: number }[]
}

export default function QuickResumeCard({ data }: { data: QuickResumeData }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors"
      >
        {open ? "Hide quick resume ↑" : "View quick resume ↓"}
      </button>

      {open && (
        <div className="mt-2 border border-[#EEEBE3] rounded-xl p-5 bg-[#FAFAF8]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="text-[15px] font-extrabold text-[#1C1C1E]">{data.name}</h4>
            <span className="text-[10.5px] font-bold bg-[#FFF7ED] text-[#F97316] border border-[#FBDDBE] px-2 py-0.5 rounded-full">
              Auto-generated · no resume uploaded
            </span>
          </div>

          {/* Contact */}
          <div className="text-[13px] text-[#4B5563] space-y-1.5 mb-3">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="shrink-0"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
              <a href={`mailto:${data.email}`} className="text-[#1D4ED8] hover:underline break-all">{data.email}</a>
            </div>
            {data.phone && (
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <a href={`tel:${data.phone}`} className="text-[#1D4ED8] hover:underline">{data.phone}</a>
              </div>
            )}
            {data.linkedinUrl && (
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#9CA3AF" className="shrink-0"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
                <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#1D4ED8] hover:underline">LinkedIn</a>
              </div>
            )}
          </div>

          {/* Desired roles */}
          {data.jobPreferences.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5">Looking for</p>
              <div className="flex flex-wrap gap-1.5">
                {data.jobPreferences.map((p, i) => (
                  <span key={i} className="text-xs font-semibold bg-white border border-[#EAE7DF] text-[#4B5563] px-2.5 py-1 rounded-full">
                    {JOB_TYPE_LABEL[p.jobType] ?? p.jobType}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.techSkills.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5">Tech skills</p>
              <div className="flex flex-wrap gap-1.5">
                {data.techSkills.map((s, i) => (
                  <span key={i} className="text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] px-2.5 py-1 rounded-full">
                    {s.language} · {s.yearsExp}yr
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.jobPreferences.length === 0 && data.techSkills.length === 0 && (
            <p className="text-[13px] text-[#9CA3AF]">This candidate hasn&apos;t added preferences or skills yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
