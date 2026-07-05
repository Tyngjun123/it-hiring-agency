import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CompanySetupForm from "./setup-form"

export default async function CompanySetupPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#1C1C1E] tracking-tight">Company Profile</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">This info appears on your job listings</p>
      </div>

      <CompanySetupForm
        defaultValues={{
          companyName: profile?.isSelfEmployed ? "" : (profile?.companyName ?? ""),
          personalName: profile?.isSelfEmployed ? (profile?.companyName ?? "") : "",
          contactEmail: profile?.contactEmail ?? "",
          accountEmail: session.user.email ?? "",
          ssm: profile?.ssm ?? "",
          linkedinUrl: profile?.linkedinUrl ?? "",
          website: profile?.website ?? "",
          description: profile?.description ?? "",
          isSelfEmployed: profile?.isSelfEmployed ?? false,
          whatsappNumber: profile?.whatsappNumber ?? "",
        }}
      />
    </div>
  )
}
