"use server"

import { resend } from "@/lib/resend"
import { redirect } from "next/navigation"

export async function sendContactMessage(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? ""
  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const company = (formData.get("company") as string | null)?.trim() ?? ""
  const topic = (formData.get("topic") as string | null)?.trim() ?? "General enquiry"
  const message = (formData.get("message") as string | null)?.trim() ?? ""

  if (!name || !email || !message) {
    redirect("/contact?error=1")
  }

  try {
    await resend.emails.send({
      from: "StackTalentx <onboarding@resend.dev>",
      to: "support@stacktalentx.com",
      replyTo: email,
      subject: `[StackTalentx Contact] ${topic} — ${name}`,
      html: `
        <h2 style="margin:0 0 16px">New contact form submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 12px 6px 0;color:#6B7280;font-size:13px">Name</td><td style="padding:6px 0;font-size:14px;font-weight:600">${name}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#6B7280;font-size:13px">Email</td><td style="padding:6px 0;font-size:14px"><a href="mailto:${email}">${email}</a></td></tr>
          ${company ? `<tr><td style="padding:6px 12px 6px 0;color:#6B7280;font-size:13px">Company</td><td style="padding:6px 0;font-size:14px">${company}</td></tr>` : ""}
          <tr><td style="padding:6px 12px 6px 0;color:#6B7280;font-size:13px">Topic</td><td style="padding:6px 0;font-size:14px">${topic}</td></tr>
        </table>
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
        <p style="white-space:pre-wrap;font-size:15px;line-height:1.6;color:#3A3A3C">${message}</p>
      `,
    })
  } catch (err) {
    console.error("Contact email failed:", err)
  }

  redirect("/contact?sent=1")
}
