import { prisma } from "@/lib/prisma"
import { resend, FROM_EMAIL } from "@/lib/resend"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Find pending applications older than 30 days with no follow-up sent
  const stale = await prisma.application.findMany({
    where: {
      status: "PENDING",
      appliedAt: { lt: thirtyDaysAgo },
      followupSentAt: null,
    },
    include: {
      jobListing: {
        include: { company: { select: { companyName: true, contactEmail: true } } },
      },
      interviewee: { include: { user: { select: { name: true, email: true } } } },
    },
  })

  let sent = 0

  for (const app of stale) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: app.jobListing.company.contactEmail,
        subject: `Reminder: Pending applicant for ${app.jobListing.title}`,
        html: `
          <p>Hi ${app.jobListing.company.companyName},</p>
          <p>You have a pending applicant for <strong>${app.jobListing.title}</strong> who applied 30 days ago and is still waiting for a response.</p>
          <p>Applicant: <strong>${app.interviewee.user.name ?? app.interviewee.user.email}</strong></p>
          <p><a href="${process.env.AUTH_URL}/company/jobs/${app.jobId}/applicants">Review applicant →</a></p>
          <br/>
          <p style="color:#888;font-size:12px;">StackTalentx · Malaysian IT Job Platform</p>
        `,
      })

      await prisma.application.update({
        where: { id: app.id },
        data: { followupSentAt: new Date() },
      })

      sent++
    } catch {
      // continue on individual email failure
    }
  }

  return NextResponse.json({ checked: stale.length, sent })
}
