import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

// After verifying stacktalentx.com in Resend, this sends from your own domain.
// Override per-environment with EMAIL_FROM if needed.
export const FROM_EMAIL = process.env.EMAIL_FROM ?? "TechireX <noreply@techirex.com>"
