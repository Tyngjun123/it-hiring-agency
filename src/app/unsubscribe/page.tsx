export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogoTile, Wordmark } from "@/components/brand"

async function resubscribeAction(formData: FormData) {
  "use server"
  const token = (formData.get("token") as string) || ""
  if (token) {
    await prisma.intervieweeProfile.updateMany({
      where: { unsubscribeToken: token },
      data: { jobAlertsOptOut: false },
    })
  }
  redirect("/unsubscribe?done=resubscribed")
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>
}) {
  const { token, done } = await searchParams

  let state: "unsubscribed" | "resubscribed" | "invalid" = "invalid"

  if (done === "resubscribed") {
    state = "resubscribed"
  } else if (token) {
    const res = await prisma.intervieweeProfile.updateMany({
      where: { unsubscribeToken: token },
      data: { jobAlertsOptOut: true },
    })
    if (res.count > 0) state = "unsubscribed"
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-[#EEEBE3] rounded-[22px] p-8 text-center shadow-[0_1px_2px_rgba(28,28,30,0.04),0_20px_50px_rgba(28,28,30,0.08)]">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <LogoTile size={30} variant="onDark" />
          <Wordmark className="text-[#1C1C1E] text-[18px] font-extrabold tracking-tight" />
        </div>

        {state === "unsubscribed" && (
          <>
            <h1 className="text-[20px] font-extrabold text-[#1C1C1E] mb-2">You&apos;ve been unsubscribed</h1>
            <p className="text-[14px] text-[#6B7280] leading-relaxed mb-6">
              You won&apos;t receive the weekly job-match emails anymore. You&apos;ll still get important
              updates about your applications.
            </p>
            <form action={resubscribeAction}>
              <input type="hidden" name="token" value={token} />
              <button type="submit"
                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[14px] py-3 rounded-[12px] transition-colors">
                Changed your mind? Resubscribe
              </button>
            </form>
          </>
        )}

        {state === "resubscribed" && (
          <>
            <h1 className="text-[20px] font-extrabold text-[#1C1C1E] mb-2">You&apos;re resubscribed 🎉</h1>
            <p className="text-[14px] text-[#6B7280] leading-relaxed mb-6">
              You&apos;ll start receiving the weekly job-match emails again.
            </p>
            <Link href="/" className="inline-block bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[14px] px-6 py-3 rounded-[12px] transition-colors">
              Browse jobs
            </Link>
          </>
        )}

        {state === "invalid" && (
          <>
            <h1 className="text-[20px] font-extrabold text-[#1C1C1E] mb-2">Link not recognised</h1>
            <p className="text-[14px] text-[#6B7280] leading-relaxed mb-6">
              This unsubscribe link looks invalid or has expired. If you keep getting unwanted emails,
              contact us at support@stacktalentx.com.
            </p>
            <Link href="/" className="inline-block bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[14px] px-6 py-3 rounded-[12px] transition-colors">
              Go to TechireX
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
