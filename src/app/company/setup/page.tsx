import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { setupCompanyProfile } from "@/app/actions/company"

export default async function CompanySetupPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Company Profile</h1>
        <p className="text-sm text-gray-500 mt-1">This info appears on your job listings</p>
      </div>

      <form action={setupCompanyProfile} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="companyName">Company name *</Label>
          <Input id="companyName" name="companyName" required defaultValue={profile?.companyName ?? ""} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="contactEmail">Contact email *</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required defaultValue={profile?.contactEmail ?? ""} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">About the company</Label>
          <Textarea id="description" name="description" rows={4} placeholder="What does your company do?" defaultValue={profile?.description ?? ""} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" type="url" placeholder="https://" defaultValue={profile?.website ?? ""} />
        </div>

        <Button type="submit" className="w-full">Save & Continue</Button>
      </form>
    </div>
  )
}
