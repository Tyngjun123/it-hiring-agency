"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { setUserRole, saveJobPreferences, saveSkills, saveResumeUrl } from "@/app/actions/onboarding"
import { createResumeUploadUrl } from "@/app/actions/resume"
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll"
import { LogoTile } from "@/components/brand"
import { TECH_SKILL_CATEGORIES, YEAR_OPTIONS, relevantCategoriesFor } from "@/data/tech-skills"

export type OnboardingStep = "role" | "preferences" | "skills" | "resume" | null

const JOB_TYPES = [
  { value: "PROJECT_COORDINATOR", label: "Project Coordinator" },
  { value: "BUSINESS_ANALYST", label: "Business Analyst" },
  { value: "QUALITY_ASSURANCE", label: "Quality Assurance" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "APPLICATION_SYSTEM_SUPPORT", label: "App System Support" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "BACKEND_DEVELOPER", label: "Backend Developer" },
  { value: "FRONTEND_DEVELOPER", label: "Frontend Developer" },
  { value: "FULLSTACK_DEVELOPER", label: "Fullstack Developer" },
  { value: "EXPLORING", label: "Still Exploring" },
]

const DEV_TYPES = new Set(["BACKEND_DEVELOPER", "FRONTEND_DEVELOPER", "FULLSTACK_DEVELOPER"])

// ─── Modal wrapper ────────────────────────────────────────────────────────────
// Desktop: centered card. Mobile: bottom sheet pinned to bottom edge.
function Modal({ children }: { children: React.ReactNode }) {
  useLockBodyScroll()
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#1C1C1E]/60 backdrop-blur-[3px] md:p-4">
      <div className="w-full md:max-w-[480px] bg-white rounded-t-[22px] md:rounded-[20px] shadow-[0_-4px_30px_rgba(28,28,30,0.18)] md:shadow-[0_30px_70px_rgba(28,28,30,0.28)] max-h-[88vh] overflow-y-auto">
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-9 h-1 rounded-full bg-[#D6D2C8]" />
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Step 1: Role selection ───────────────────────────────────────────────────
function RoleStep() {
  const [role, setRole] = useState<"INTERVIEWEE" | "COMPANY" | null>(null)
  const [isPending, startTransition] = useTransition()
  const { update } = useSession()
  const router = useRouter()

  function handleContinue() {
    if (!role) return
    startTransition(async () => {
      await setUserRole(role)
      await update() // refresh JWT so role is in session
      if (role === "COMPANY") {
        router.push("/company/setup")
      } else {
        router.refresh()
      }
    })
  }

  return (
    <Modal>
      <div className="px-8 pt-8 pb-6 text-center border-b border-[#F4F1EA]">
        <div className="mx-auto mb-4 w-fit"><LogoTile size={52} variant="onDark" /></div>
        <h2 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight mb-1">Welcome to StackTalentx</h2>
        <p className="text-[14px] text-[#9CA3AF]">How will you be using the platform?</p>
      </div>

      <div className="px-8 py-6 space-y-3">
        {(["INTERVIEWEE", "COMPANY"] as const).map(r => (
          <button key={r} type="button" onClick={() => setRole(r)}
            className={`w-full p-4 rounded-[14px] border-2 text-left transition-all ${
              role === r
                ? "border-[#F97316] bg-[#FFF7ED]"
                : "border-[#E6E2D9] hover:border-[#F97316]/40 bg-white"
            }`}>
            <p className="text-[15px] font-bold text-[#1C1C1E]">
              {r === "INTERVIEWEE" ? "I'm looking for a job" : "I'm hiring"}
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-0.5">
              {r === "INTERVIEWEE" ? "Browse listings and apply to IT positions" : "Post jobs and find IT talent"}
            </p>
          </button>
        ))}

        <button onClick={handleContinue} disabled={!role || isPending}
          className="w-full mt-2 py-3.5 rounded-[12px] text-[15px] font-bold transition-all bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 text-white shadow-[0_8px_18px_rgba(249,115,22,0.3)]">
          {isPending ? "Saving…" : "Continue"}
        </button>
      </div>
    </Modal>
  )
}

// ─── Step 2: Job preferences ──────────────────────────────────────────────────
function PreferencesStep() {
  const [selected, setSelected] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle(value: string) {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : prev.length < 3 ? [...prev, value] : prev
    )
  }

  function handleContinue() {
    if (selected.length === 0) return
    startTransition(async () => {
      await saveJobPreferences(selected)
      router.refresh()
    })
  }

  function handleSkip() {
    startTransition(async () => {
      await saveJobPreferences(["EXPLORING"])
      router.refresh()
    })
  }

  return (
    <Modal>
      <div className="px-7 pt-7 pb-5 border-b border-[#F4F1EA]">
        <p className="text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-2">Step 1 of 3</p>
        <h2 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight mb-1">What type of role are you looking for?</h2>
        <p className="text-[13.5px] text-[#9CA3AF]">Pick up to 3 · helps us surface the right jobs</p>
      </div>

      <div className="px-7 py-5">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {JOB_TYPES.map(type => {
            const isSelected = selected.includes(type.value)
            const isDisabled = !isSelected && selected.length >= 3
            return (
              <button key={type.value} type="button" onClick={() => toggle(type.value)} disabled={isDisabled}
                className={`flex items-center gap-2 text-[13px] font-semibold px-3 py-2.5 rounded-[11px] border transition-all text-left ${
                  isSelected ? "bg-[#FFF1E1] text-[#C2410C] border-[#F97316] font-bold"
                  : isDisabled ? "bg-white text-[#D1CAC0] border-[#EAE8E2] cursor-not-allowed"
                  : "bg-white text-[#3A3A3C] border-[#E6E2D9] hover:border-[#F97316]/50"
                }`}>
                {isSelected && <span className="text-[11px] shrink-0">✓</span>}
                {type.label}
              </button>
            )
          })}
        </div>

        <p className="text-center text-[12.5px] font-semibold text-[#F97316] mb-4">{selected.length}/3 selected</p>

        <button onClick={handleContinue} disabled={selected.length === 0 || isPending}
          className="w-full py-3.5 rounded-[12px] text-[15px] font-bold transition-all bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 text-white shadow-[0_8px_18px_rgba(249,115,22,0.3)]">
          {isPending ? "Saving…" : "Continue"}
        </button>

        <button type="button" onClick={handleSkip} disabled={isPending}
          className="w-full text-center text-[13.5px] font-semibold text-[#9CA3AF] hover:text-[#6B7280] mt-3">
          Skip for now
        </button>
      </div>
    </Modal>
  )
}

// ─── Step 3: Tech skills ──────────────────────────────────────────────────────
function SkillsStep({ jobTypes }: { jobTypes: string[] }) {
  // Show only the skill categories relevant to the roles the seeker picked.
  // relevantCategoriesFor returns null for "Exploring"/none → show all categories.
  const relevant = relevantCategoriesFor(jobTypes)
  const allCategories = Object.keys(TECH_SKILL_CATEGORIES)
  const categories = relevant ? allCategories.filter(c => relevant.includes(c)) : allCategories

  const [selected, setSelected] = useState<Map<string, number>>(() => new Map())
  const [isPending, startTransition] = useTransition()
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const router = useRouter()

  function toggle(lang: string) {
    setSelected(prev => {
      const next = new Map(prev)
      if (next.has(lang)) next.delete(lang)
      else next.set(lang, 1)
      return next
    })
  }

  function setYears(lang: string, years: number) {
    setSelected(prev => {
      const next = new Map(prev)
      next.set(lang, years)
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      const skills = Array.from(selected.entries()).map(([language, yearsExp]) => ({ language, yearsExp }))
      await saveSkills(skills)
      router.refresh()
    })
  }

  function handleSkip() {
    startTransition(async () => {
      await saveSkills([])
      router.refresh()
    })
  }

  return (
    <Modal>
      <div className="px-7 pt-7 pb-5 border-b border-[#F4F1EA]">
        <p className="text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-2">Step 2 of 3</p>
        <h2 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight mb-1">Your tech skills</h2>
        <p className="text-[13.5px] text-[#9CA3AF]">{selected.size} selected · set years of experience per skill</p>
      </div>

      <div className="px-7 py-5 max-h-[60vh] overflow-y-auto">
        {/* Category tabs */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {categories.map(cat => (
            <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
              className={`text-[12px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === cat
                  ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                  : "bg-white text-[#6B7280] border-[#E6E2D9] hover:border-[#9CA3AF]"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {(TECH_SKILL_CATEGORIES[activeCategory] ?? []).map(lang => {
            const isSelected = selected.has(lang)
            return (
              <div key={lang}>
                <button type="button" onClick={() => toggle(lang)}
                  className={`w-full text-left text-[13px] font-semibold px-3 py-2.5 rounded-[10px] border transition-all ${
                    isSelected ? "bg-[#FFF1E1] text-[#C2410C] border-[#F97316]"
                    : "bg-white text-[#3A3A3C] border-[#E6E2D9] hover:border-[#F97316]/50"
                  }`}>
                  {isSelected && <span className="text-[10px] mr-1">✓</span>}
                  {lang}
                </button>
                {isSelected && (
                  <select value={selected.get(lang)} onChange={e => setYears(lang, Number(e.target.value))}
                    className="mt-1 w-full text-[12px] border border-[#E6E2D9] rounded-[8px] px-2 py-1.5 text-[#3A3A3C] focus:outline-none focus:border-[#F97316]">
                    {YEAR_OPTIONS.map(y => (
                      <option key={y} value={y}>{y} yr{y !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="px-7 pb-6 border-t border-[#F4F1EA] pt-4">
        <button onClick={handleSave} disabled={isPending}
          className="w-full py-3.5 rounded-[12px] text-[15px] font-bold bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 text-white shadow-[0_8px_18px_rgba(249,115,22,0.3)] transition-colors">
          {isPending ? "Saving…" : selected.size > 0 ? `Save ${selected.size} skill${selected.size !== 1 ? "s" : ""}` : "Continue"}
        </button>
        <button type="button" onClick={handleSkip} disabled={isPending}
          className="w-full text-center text-[13.5px] font-semibold text-[#9CA3AF] hover:text-[#6B7280] mt-3">
          Skip for now
        </button>
      </div>
    </Modal>
  )
}

// ─── Step 4: Resume upload ────────────────────────────────────────────────────
function ResumeStep({ isLastStep }: { isLastStep: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [phone, setPhone] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleUpload() {
    if (!file) {
      setUploading(true)
      await saveResumeUrl("", phone)
      router.refresh()
      return
    }
    setUploading(true)
    setError("")
    const ext = file.name.split(".").pop() ?? "pdf"
    const signed = await createResumeUploadUrl(ext)
    if ("error" in signed) { setError(signed.error); setUploading(false); return }
    const { error: uploadError } = await supabase.storage.from("resumes").uploadToSignedUrl(signed.path, signed.token, file)
    if (uploadError) { setError("Upload failed. Please try again."); setUploading(false); return }
    await saveResumeUrl(signed.path, phone)
    router.refresh()
  }

  return (
    <Modal>
      <div className="px-7 pt-7 pb-5 border-b border-[#F4F1EA]">
        <p className="text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-2">
          {isLastStep ? "Step 3 of 3" : "Step 2 of 2"}
        </p>
        <h2 className="text-[20px] font-extrabold text-[#1C1C1E] tracking-tight mb-1">Upload your resume</h2>
        <p className="text-[13.5px] text-[#9CA3AF]">PDF or Word document, max 5 MB</p>
      </div>

      <div className="px-7 py-6">
        {/* Optional phone — lets companies contact you directly/faster */}
        <div className="mb-5">
          <label className="text-[13px] font-bold text-[#3A3A3C] block mb-1.5">
            Phone / WhatsApp <span className="text-[#9CA3AF] font-normal">(optional)</span>
          </label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+60 12-345 6789"
            className="w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-3 text-[14px] text-[#1C1C1E] placeholder-[#A8A49A] focus:outline-none focus:border-[#F97316] transition-colors" />
          <p className="text-[12px] text-[#9CA3AF] mt-1.5">Adding this lets companies reach you directly and faster.</p>
        </div>

        <label className="block mb-4 cursor-pointer">
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

        {error && <p className="text-sm text-[#DC2626] font-medium mb-3">{error}</p>}

        <button onClick={handleUpload} disabled={uploading}
          className="w-full py-3.5 rounded-[12px] text-[15px] font-bold bg-[#1C1C1E] hover:bg-[#2A2A2E] text-white transition-colors mb-3">
          {uploading ? "Uploading…" : file ? "Upload & finish" : "Skip & finish"}
        </button>
      </div>
    </Modal>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function OnboardingFlow({ step, jobTypes }: { step: OnboardingStep; jobTypes: string[] }) {
  if (!step) return null

  if (step === "role") return <RoleStep />
  if (step === "preferences") return <PreferencesStep />
  if (step === "skills") return <SkillsStep jobTypes={jobTypes} />
  if (step === "resume") return <ResumeStep isLastStep={true} />

  return null
}
