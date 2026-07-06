"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { unlockResume, getPoolResumeViewUrl } from "@/app/actions/resume-pool"

export default function ResumePoolActions({
  intervieweeId,
  unlocked: initiallyUnlocked,
  free,
}: {
  intervieweeId: string
  unlocked: boolean
  free: boolean
}) {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState(initiallyUnlocked)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function openResume() {
    setBusy(true)
    const res = await getPoolResumeViewUrl(intervieweeId)
    setBusy(false)
    if ("url" in res) window.open(res.url, "_blank", "noopener,noreferrer")
    else toast.error(res.error)
  }

  async function confirmUnlock() {
    setBusy(true)
    const res = await unlockResume(intervieweeId)
    setBusy(false)
    setConfirming(false)
    if (res.ok) {
      setUnlocked(true)
      toast.success(res.free ? "Résumé unlocked (free — this seeker applied to you)." : "Résumé unlocked.")
      router.refresh() // update the token balance shown on the page
    } else if (res.error === "upgrade") {
      toast.error("Resume Pool is available on Pro and Max plans.")
    } else if (res.error === "no_tokens") {
      toast.error("You're out of tokens this month. They refill next billing cycle.")
    } else {
      toast.error("This résumé is no longer available.")
    }
  }

  if (unlocked) {
    return (
      <button
        type="button"
        onClick={openResume}
        disabled={busy}
        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-[11px] text-sm font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] hover:bg-[#D1FAE5] transition-colors disabled:opacity-60"
      >
        {busy ? "Opening…" : "View résumé"}
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-[11px] text-sm font-bold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors"
      >
        🔓 Unlock résumé
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !busy && setConfirming(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-[#EEEBE3]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-extrabold text-[#1C1C1E]">Unlock this résumé?</h3>
            <p className="text-sm text-[#6B7280] mt-2">
              {free ? (
                <>This seeker applied to one of your jobs, so unlocking is <strong>free</strong>.</>
              ) : (
                <>This will use <strong>1 token</strong> from your monthly balance. Once unlocked, viewing it again is free.</>
              )}
            </p>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-[11px] text-sm font-bold text-[#6B7280] bg-[#F4F2EC] hover:bg-[#E9E6DD] transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUnlock}
                disabled={busy}
                className="flex-1 px-4 py-2.5 rounded-[11px] text-sm font-bold bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors disabled:opacity-60"
              >
                {busy ? "Unlocking…" : free ? "Unlock (free)" : "Use 1 token"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
