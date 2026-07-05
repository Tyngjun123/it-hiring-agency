"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveJobPreferences } from "@/app/actions/onboarding"

const JOB_TYPES = [
  { value: "PROJECT_COORDINATOR", label: "Project Coordinator" },
  { value: "BUSINESS_ANALYST", label: "Business Analyst" },
  { value: "QUALITY_ASSURANCE", label: "Quality Assurance" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "APPLICATION_SYSTEM_SUPPORT", label: "Application System Support" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "BACKEND_DEVELOPER", label: "Backend Developer" },
  { value: "FRONTEND_DEVELOPER", label: "Frontend Developer" },
  { value: "FULLSTACK_DEVELOPER", label: "Fullstack Developer" },
  { value: "EXPLORING", label: "New — Still Exploring" },
]

export default function PreferencesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function toggle(value: string) {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : prev.length < 3 ? [...prev, value] : prev
    )
  }

  async function handleContinue() {
    if (selected.length === 0) return
    setLoading(true)
    await saveJobPreferences(selected)
    const hasDev = selected.some(s => ["BACKEND_DEVELOPER", "FRONTEND_DEVELOPER", "FULLSTACK_DEVELOPER"].includes(s))
    router.push(hasDev ? "/onboarding/skills" : "/onboarding/resume")
  }

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg,#FFF7ED 0%,#FFFBF5 100%)" }}>
      {/* Blurred backdrop content */}
      <div className="filter blur-sm pointer-events-none select-none opacity-60 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 py-12">
            <h1 className="text-4xl font-extrabold text-[#1C1C1E]">Find your next role <span className="text-[#F97316]">in tech</span></h1>
            <p className="text-[#6B7280]">The job board built only for Malaysian IT professionals.</p>
          </div>
        </div>
      </div>

      {/* Modal overlay */}
      <div className="absolute inset-0 bg-[#1C1C1E]/50 backdrop-blur-[2px] flex items-center justify-center p-6">
        <div className="w-full max-w-[460px] bg-white rounded-[20px] p-8 shadow-[0_30px_70px_rgba(28,28,30,.3)]">
          <div className="text-center mb-6">
            <h2 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mb-1.5">
              What type of role are you looking for?
            </h2>
            <p className="text-[14px] text-[#9CA3AF]">Pick up to 3</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {JOB_TYPES.map(type => {
              const isSelected = selected.includes(type.value)
              const isDisabled = !isSelected && selected.length >= 3
              return (
                <button key={type.value} type="button" onClick={() => toggle(type.value)} disabled={isDisabled}
                  className={`flex items-center gap-2 text-[13.5px] font-semibold px-3.5 py-2.5 rounded-[11px] border transition-all text-left ${
                    isSelected
                      ? "bg-[#FFF1E1] text-[#C2410C] border-[#F97316] font-bold"
                      : isDisabled
                      ? "bg-white text-[#D1CAC0] border-[#EAE8E2] cursor-not-allowed"
                      : "bg-white text-[#3A3A3C] border-[#E6E2D9] hover:border-[#F97316]/50"
                  }`}>
                  {isSelected && <span className="text-[12px] shrink-0">✓</span>}
                  {type.label}
                </button>
              )
            })}
          </div>

          <p className="text-center text-[13px] font-semibold text-[#F97316] mb-4">{selected.length}/3 selected</p>

          <button onClick={handleContinue} disabled={selected.length === 0 || loading}
            className={`w-full py-3.5 rounded-[12px] text-[15px] font-bold transition-all ${
              selected.length > 0
                ? "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[0_8px_18px_rgba(249,115,22,0.3)]"
                : "bg-[#D9D5CC] text-white cursor-not-allowed"
            }`}>
            {loading ? "Saving…" : "Continue"}
          </button>

          <button type="button" onClick={() => router.push("/onboarding/resume")}
            className="w-full text-center text-[14px] font-semibold text-[#9CA3AF] hover:text-[#6B7280] mt-4">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
