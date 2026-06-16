import { resend, FROM_EMAIL } from "@/lib/resend"

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
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Application submitted — ${jobTitle}`,
    html: `
      <p>Hi ${applicantName},</p>
      <p>Your application for <strong>${jobTitle}</strong>${companyName ? ` at <strong>${companyName}</strong>` : ""} has been received.</p>
      <p>The company will review your profile and reach out if there's a match. We'll notify you once a decision is made.</p>
      <p><a href="${process.env.AUTH_URL}/jobs/${jobId}">View job listing →</a></p>
      <br/>
      <p style="color:#888;font-size:12px;">IT Hire · Malaysian IT Job Platform</p>
    `,
  })
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
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New applicant for ${jobTitle}`,
    html: `
      <p>Hi ${companyName},</p>
      <p><strong>${applicantName}</strong> (${applicantEmail}) has applied for <strong>${jobTitle}</strong>.</p>
      <p><a href="${process.env.AUTH_URL}/company/jobs/${jobId}/applicants">Review applicants →</a></p>
      <br/>
      <p style="color:#888;font-size:12px;">IT Hire · Malaysian IT Job Platform</p>
    `,
  })
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
  const hired = status === "SUCCESS"

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: hired
      ? `Congratulations! You've been selected for ${jobTitle}`
      : `Update on your application for ${jobTitle}`,
    html: hired
      ? `
        <p>Hi ${applicantName},</p>
        <p>Great news! <strong>${companyName}</strong> has selected you for the <strong>${jobTitle}</strong> role.</p>
        <p>The company will contact you directly to discuss next steps.</p>
        <br/>
        <p style="color:#888;font-size:12px;">IT Hire · Malaysian IT Job Platform</p>
      `
      : `
        <p>Hi ${applicantName},</p>
        <p>Thank you for applying to <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <p>After careful review, the company has decided to move forward with other candidates at this time.</p>
        <p>Don't be discouraged — keep applying and you'll find the right fit. <a href="${process.env.AUTH_URL}">Browse more jobs →</a></p>
        <br/>
        <p style="color:#888;font-size:12px;">IT Hire · Malaysian IT Job Platform</p>
      `,
  })
}
