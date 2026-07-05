import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { updateJobListing } from "@/app/actions/company"
import JobForm from "@/components/job-form"

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect("/company/setup")

  const job = await prisma.jobListing.findUnique({ where: { id, companyId: profile.id } })
  if (!job) redirect("/company/jobs")

  const action = async (formData: FormData) => {
    "use server"
    await updateJobListing(id, formData)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit job</h1>
        <p className="text-sm text-gray-500 mt-1">{job.title}</p>
      </div>
      <JobForm
        action={action}
        submitLabel="Save Changes"
        defaultValues={{
          title: job.title,
          location: job.location,
          description: job.description,
          workType: job.workType,
          employmentType: job.employmentType,
          payType: job.payType,
          payRangeFrom: job.payRangeFrom,
          payRangeTo: job.payRangeTo,
          sellingPoint1: job.sellingPoint1,
          sellingPoint2: job.sellingPoint2,
          sellingPoint3: job.sellingPoint3,
          hideCompanyInfo: job.hideCompanyInfo,
          requiredSkills: job.requiredSkills,
        }}
      />
    </div>
  )
}
