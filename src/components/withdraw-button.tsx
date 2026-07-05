"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { withdrawApplication } from "@/app/actions/jobs"

export default function WithdrawButton({ applicationId }: { applicationId: string }) {
  const [pending, start] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Withdraw this application? You can apply again later.")) return
        start(async () => {
          const res = await withdrawApplication(applicationId)
          if (res?.error) toast.error(res.error)
          else toast.success("Application withdrawn")
        })
      }}
      className="text-xs font-semibold text-[#9CA3AF] hover:text-red-500 disabled:opacity-50 transition-colors"
    >
      {pending ? "Withdrawing…" : "Withdraw"}
    </button>
  )
}
