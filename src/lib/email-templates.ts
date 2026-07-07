import { prisma } from "./prisma"

export type EmailTemplateDef = {
  key: string
  name: string
  subject: string
  body: string // inner HTML, supports {{placeholders}}
  placeholders: string[]
}

// Default templates — used when no DB override exists. Admin can override subject/body via CMS.
export const DEFAULT_TEMPLATES: EmailTemplateDef[] = [
  {
    key: "application_confirmation",
    name: "Application confirmation (to job seeker)",
    subject: "Application submitted — {{jobTitle}}",
    body:
      `<p>Hi {{applicantName}},</p>` +
      `<p>Your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been received.</p>` +
      `<p>The company will review your profile and reach out if there's a match. We'll notify you once a decision is made.</p>` +
      `<p><a href="{{jobUrl}}">View job listing →</a></p>`,
    placeholders: ["applicantName", "jobTitle", "companyName", "jobUrl"],
  },
  {
    key: "new_applicant_alert",
    name: "New applicant alert (to company)",
    subject: "New applicant for {{jobTitle}}",
    body:
      `<p>Hi {{companyName}},</p>` +
      `<p><strong>{{applicantName}}</strong> ({{applicantEmail}}) has applied for <strong>{{jobTitle}}</strong>.</p>` +
      `<p><a href="{{applicantsUrl}}">Review applicants →</a></p>`,
    placeholders: ["companyName", "applicantName", "applicantEmail", "jobTitle", "applicantsUrl"],
  },
  {
    key: "result_hired",
    name: "Result — Hired (to job seeker)",
    subject: "Congratulations! You've been selected for {{jobTitle}}",
    body:
      `<p>Hi {{applicantName}},</p>` +
      `<p>Great news! <strong>{{companyName}}</strong> has selected you for the <strong>{{jobTitle}}</strong> role.</p>` +
      `<p>The company will contact you directly to discuss next steps.</p>`,
    placeholders: ["applicantName", "jobTitle", "companyName"],
  },
  {
    key: "result_rejected",
    name: "Result — Not selected (to job seeker)",
    subject: "Update on your application for {{jobTitle}}",
    body:
      `<p>Hi {{applicantName}},</p>` +
      `<p>Thank you for applying to <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>` +
      `<p>After careful review, the company has decided to move forward with other candidates at this time.</p>` +
      `<p>Don't be discouraged — keep applying and you'll find the right fit. <a href="{{siteUrl}}">Browse more jobs →</a></p>`,
    placeholders: ["applicantName", "jobTitle", "companyName", "siteUrl"],
  },
  {
    key: "password_reset_otp",
    name: "Password reset code (OTP)",
    subject: "Your TechireX password reset code",
    body:
      `<p>Hi,</p>` +
      `<p>Your password reset code is:</p>` +
      `<p style="font-size:28px;font-weight:800;letter-spacing:6px;color:#F97316;">{{code}}</p>` +
      `<p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
    placeholders: ["code"],
  },
  {
    key: "candidate_match_digest",
    name: "New matching candidates (to company)",
    subject: "{{count}} new candidate(s) matching your jobs",
    body:
      `<p>Hi {{companyName}},</p>` +
      `<p>{{count}} new job seeker(s) matching your job requirements just joined TechireX:</p>` +
      `{{matchList}}` +
      `<p><a href="{{siteUrl}}/company/jobs">View your jobs →</a></p>`,
    placeholders: ["companyName", "count", "matchList", "siteUrl"],
  },
]

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "")
}

// Fixed branded wrapper — admin edits only the inner message, structure stays safe.
function wrap(inner: string): string {
  return (
    `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1C1C1E;line-height:1.6;">` +
    inner +
    `<br/><hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>` +
    `<p style="color:#888;font-size:12px;">TechireX · Malaysian IT Job Platform</p>` +
    `</div>`
  )
}

export async function renderEmail(
  key: string,
  vars: Record<string, string>
): Promise<{ subject: string; html: string }> {
  const def = DEFAULT_TEMPLATES.find((t) => t.key === key)
  let subjectTpl = def?.subject ?? ""
  let bodyTpl = def?.body ?? ""

  try {
    const override = await prisma.emailTemplate.findUnique({ where: { key } })
    if (override) {
      subjectTpl = override.subject
      bodyTpl = override.body
    }
  } catch {
    // DB unavailable — fall back to defaults
  }

  return {
    subject: interpolate(subjectTpl, vars),
    html: wrap(interpolate(bodyTpl, vars)),
  }
}
