import { resend, FROM_EMAIL } from "@/lib/resend"
import { renderEmail } from "@/lib/email-templates"
import { getSiteUrl } from "@/lib/site-url"

// ─── Application confirmed (to job seeker) ───────────────────────────────────

export async function sendApplicationConfirmation({
  to,
  applicantName,
  jobTitle,
  companyName,
  jobId,
}: {
  to: string
  applicantName: string
  jobTitle: string
  companyName: string | null
  jobId: string
}) {
  const { subject, html } = await renderEmail("application_confirmation", {
    applicantName,
    jobTitle,
    companyName: companyName ?? "a hiring company",
    jobUrl: `${getSiteUrl()}/jobs/${jobId}`,
  })
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
}

// ─── New applicant alert (to company) ────────────────────────────────────────

export async function sendNewApplicantAlert({
  to,
  companyName,
  jobTitle,
  applicantName,
  applicantEmail,
  jobId,
}: {
  to: string
  companyName: string
  jobTitle: string
  applicantName: string
  applicantEmail: string
  jobId: string
}) {
  const { subject, html } = await renderEmail("new_applicant_alert", {
    companyName,
    jobTitle,
    applicantName,
    applicantEmail,
    applicantsUrl: `${getSiteUrl()}/company/jobs/${jobId}/applicants`,
  })
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
}

// ─── Result notification (to job seeker) ─────────────────────────────────────

export async function sendResultNotification({
  to,
  applicantName,
  jobTitle,
  companyName,
  status,
}: {
  to: string
  applicantName: string
  jobTitle: string
  companyName: string
  status: "SUCCESS" | "FAIL"
}) {
  const { subject, html } = await renderEmail(
    status === "SUCCESS" ? "result_hired" : "result_rejected",
    { applicantName, jobTitle, companyName, siteUrl: getSiteUrl() }
  )
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
}

// ─── Password reset OTP (to job seeker / any user) ───────────────────────────

export async function sendPasswordResetCode({ to, code }: { to: string; code: string }) {
  const { subject, html } = await renderEmail("password_reset_otp", { code })
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
}

// ─── Weekly job-match digest (to job seeker) ─────────────────────────────────

export async function sendJobMatchDigest({
  to,
  name,
  jobs,
  unsubscribeUrl,
}: {
  to: string
  name: string | null
  jobs: { id: string; title: string; company: string | null; location: string; payFrom: number; payTo: number }[]
  unsubscribeUrl: string
}) {
  const siteUrl = getSiteUrl()
  const greeting = name ? `Hi ${name},` : "Hi,"

  const cards = jobs
    .map(
      (j) => `
      <tr><td style="padding:0 0 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EEEBE3;border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <a href="${siteUrl}/jobs/${j.id}" style="font-size:15px;font-weight:700;color:#1C1C1E;text-decoration:none;">${j.title}</a>
            <div style="font-size:13px;color:#6B7280;margin-top:3px;">${j.company ?? "Confidential"}${j.location ? " · " + j.location : ""}</div>
            <div style="font-size:14px;font-weight:700;color:#1C1C1E;margin-top:8px;">RM ${j.payFrom.toLocaleString()} – RM ${j.payTo.toLocaleString()} <span style="font-size:12px;font-weight:500;color:#9CA3AF;">/ month</span></div>
            <a href="${siteUrl}/jobs/${j.id}" style="display:inline-block;margin-top:10px;font-size:13px;font-weight:700;color:#F97316;text-decoration:none;">View job →</a>
          </td></tr>
        </table>
      </td></tr>`,
    )
    .join("")

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1C1C1E;line-height:1.6;max-width:560px;margin:0 auto;">
    <p style="font-size:15px;">${greeting}</p>
    <p style="font-size:15px;">Here ${jobs.length === 1 ? "is" : "are"} <strong>${jobs.length} new job${jobs.length === 1 ? "" : "s"}</strong> matching your preferences this week:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">${cards}</table>
    <p style="font-size:14px;margin-top:18px;"><a href="${siteUrl}" style="color:#F97316;font-weight:700;text-decoration:none;">Browse all jobs →</a></p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0 14px;"/>
    <p style="color:#9CA3AF;font-size:12px;">
      You're receiving this because you're a TechireX member.
      <a href="${unsubscribeUrl}" style="color:#9CA3AF;text-decoration:underline;">Unsubscribe from job alerts</a>.
    </p>
    <p style="color:#B6B2A8;font-size:11px;">TechireX · Malaysian IT Job Platform</p>
  </div>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${jobs.length} new job${jobs.length === 1 ? "" : "s"} matching you this week`,
    html,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  })
}

// ─── Candidate match digest (to company) ─────────────────────────────────────

export async function sendCandidateMatchDigest({
  to,
  companyName,
  count,
  matchListHtml,
}: {
  to: string
  companyName: string
  count: number
  matchListHtml: string
}) {
  const { subject, html } = await renderEmail("candidate_match_digest", {
    companyName,
    count: String(count),
    matchList: matchListHtml,
    siteUrl: getSiteUrl(),
  })
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
}
