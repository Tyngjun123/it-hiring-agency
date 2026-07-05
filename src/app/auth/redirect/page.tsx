export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function AuthRedirectPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      companyProfile: { select: { id: true } },
    },
  })

  if (user?.role === "COMPANY") {
    redirect(user.companyProfile ? "/company/jobs" : "/company/setup")
  }

  if (user?.role === "INTERVIEWEE") {
    redirect("/")
  }

  redirect("/onboarding/role")
}
