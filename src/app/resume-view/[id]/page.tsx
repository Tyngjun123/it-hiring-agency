export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getPoolResumeViewUrl } from "@/app/actions/resume-pool"
import ResumeWatermarkViewer from "@/components/resume-watermark-viewer"

export default async function ResumeViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { companyName: true, contactEmail: true },
  })
  if (!profile) redirect("/company/setup")

  // Authorization is enforced here — only returns a URL if unlocked or applied.
  const res = await getPoolResumeViewUrl(id)

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC"
  const watermark = `${profile.companyName} · ${profile.contactEmail} · ${stamp}`

  return (
    <div className="min-h-screen bg-[#3A3A3C] flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#1C1C1E] text-white px-4 py-3 flex items-center justify-between">
        <Link href="/company/resume-pool" className="text-sm font-semibold text-[#D6D2C8] hover:text-white">
          ← Resume Pool
        </Link>
        <span className="text-[11px] text-[#9CA3AF]">
          Protected view · watermarked to your account
        </span>
      </div>

      <div className="flex-1 p-4">
        {"error" in res ? (
          <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl p-8 text-center">
            <p className="text-lg font-extrabold text-[#1C1C1E]">Résumé locked</p>
            <p className="text-sm text-[#6B7280] mt-2">{res.error}</p>
            <Link
              href="/company/resume-pool"
              className="inline-flex items-center mt-5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-[11px] px-5 h-10"
            >
              Back to Resume Pool
            </Link>
          </div>
        ) : (
          <ResumeWatermarkViewer url={res.url} watermark={watermark} />
        )}
      </div>
    </div>
  )
}
