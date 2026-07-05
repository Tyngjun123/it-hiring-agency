"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { applyToJob } from "@/app/actions/jobs"
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll"

export default function ApplyButton({
  jobId,
  jobTitle,
  questions,
  className,
  label = "Apply Now",
}: {
  jobId: string
  jobTitle: string
  questions?: string | null
  className?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [pending, start] = useTransition()
  const router = useRouter()
  useLockBodyScroll(open)

  // Parse the employer's free-text questions into individual lines.
  const parsedQuestions = (questions ?? "")
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean)
  const hasQuestions = parsedQuestions.length > 0

  const [answers, setAnswers] = useState<string[]>([])

  function openModal() {
    setError("")
    setAnswers(parsedQuestions.map(() => ""))
    setOpen(true)
  }

  function confirmApply() {
    setError("")
    if (hasQuestions && answers.some((a) => !a.trim())) {
      setError("Please answer all the employer's questions.")
      return
    }
    const payload = hasQuestions
      ? parsedQuestions.map((q, i) => ({ question: q, answer: answers[i].trim() }))
      : undefined
    start(async () => {
      const res = await applyToJob(jobId, payload)
      if (res?.error) {
        setError(res.error === "already_applied" ? "You've already applied to this job." : res.error)
      } else {
        setOpen(false)
        toast.success("Application submitted!")
        router.refresh()
      }
    })
  }

  return (
    <>
      <button type="button" onClick={openModal} className={className}>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1C1C1E]/50 backdrop-blur-[2px]" onClick={() => !pending && setOpen(false)} />
          <div className="relative w-full max-w-[440px] bg-white rounded-[20px] p-7 shadow-[0_30px_70px_rgba(28,28,30,.3)] max-h-[88vh] overflow-y-auto">
            {hasQuestions ? (
              <>
                <h3 className="text-[19px] font-extrabold text-[#1C1C1E] mb-1">A few questions first</h3>
                <p className="text-[13.5px] text-[#6B7280] mb-5">
                  <strong className="text-[#1C1C1E]">{jobTitle}</strong> — the employer would like you to answer:
                </p>
                <div className="space-y-4 text-left">
                  {parsedQuestions.map((q, i) => (
                    <div key={i}>
                      <label className="block text-[13.5px] font-semibold text-[#3A3A3C] mb-1.5">{q}</label>
                      <textarea
                        rows={2}
                        value={answers[i] ?? ""}
                        onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
                        className="w-full border border-[#E6E2D9] rounded-[11px] px-3.5 py-2.5 text-[14px] text-[#1C1C1E] focus:outline-none focus:border-[#F97316] transition-colors resize-none"
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#FFF7ED] text-[#F97316] flex items-center justify-center text-xl mx-auto mb-4">✓</div>
                <h3 className="text-[19px] font-extrabold text-[#1C1C1E] mb-1.5">Apply to this job?</h3>
                <p className="text-[14px] text-[#6B7280]">
                  You&apos;re about to apply for <strong className="text-[#1C1C1E]">{jobTitle}</strong>. The company will be able to view your profile.
                </p>
              </div>
            )}

            {error && <p className="text-sm text-[#DC2626] font-medium mt-4">{error}</p>}

            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setOpen(false)} disabled={pending}
                className="flex-1 border border-[#E6E2D9] text-[#6B7280] font-bold py-3 rounded-[12px] hover:bg-[#FAFAF8] transition-colors">
                Cancel
              </button>
              <button type="button" onClick={confirmApply} disabled={pending}
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white font-bold py-3 rounded-[12px] shadow-[0_6px_15px_rgba(249,115,22,.3)] transition-colors">
                {pending ? "Applying…" : hasQuestions ? "Submit application" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
