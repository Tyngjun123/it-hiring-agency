"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"

// Maps ?toast=<key> (set by server actions on redirect) to a message.
const MESSAGES: Record<string, string> = {
  profile_saved: "Profile saved",
  company_saved: "Company profile saved",
  job_posted: "Job posted",
  job_updated: "Job updated",
  job_paused: "Job paused",
  job_activated: "Job activated",
  job_closed: "Job closed",
  job_duplicated: "Job duplicated as draft",
  applicant_hired: "Applicant marked as hired",
  applicant_rejected: "Applicant rejected",
  settings_saved: "Settings saved",
  email_saved: "Email template saved",
  cms_saved: "Content saved",
  blog_saved: "Blog post saved",
  plan_saved: "Company plan updated",
  maintenance_on: "Maintenance mode enabled",
  maintenance_off: "Maintenance mode disabled",
  payment_approved: "Payment approved",
  payment_rejected: "Payment rejected",
  registered: "Account created! Please sign in.",
}

const ERROR_MESSAGES: Record<string, string> = {
  free_limit: "Free plan limit reached — up to 10 active jobs. Upgrade to Pro for more.",
  pro_limit: "Pro plan limit reached — up to 30 active jobs.",
}

export default function ToastBridge() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const shown = useRef<string | null>(null)

  const key = params.get("toast")
  const errKey = params.get("toastError")

  useEffect(() => {
    const active = key ?? (errKey ? `err:${errKey}` : null)
    if (!active || shown.current === active) return

    const successMsg = key ? MESSAGES[key] : undefined
    const errorMsg = errKey ? ERROR_MESSAGES[errKey] : undefined
    if (!successMsg && !errorMsg) return

    if (errorMsg) toast.error(errorMsg)
    else if (successMsg) toast.success(successMsg)
    shown.current = active

    // Clean the params so a refresh doesn't re-fire the toast
    const sp = new URLSearchParams(params.toString())
    sp.delete("toast")
    sp.delete("toastError")
    const qs = sp.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [key, errKey, params, pathname, router])

  return null
}
