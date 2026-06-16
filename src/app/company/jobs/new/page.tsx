import { createJobListing } from "@/app/actions/company"
import JobForm from "@/components/job-form"

export default function NewJobPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Post a job</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to publish your listing</p>
      </div>
      <JobForm action={createJobListing} submitLabel="Post Job" />
    </div>
  )
}
