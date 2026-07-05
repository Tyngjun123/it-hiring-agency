import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CompanyProfileClient from "@/components/company-profile-client"
import { submitReview } from "@/app/actions/review"

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  const company = await prisma.companyProfile.findUnique({
    where: { id },
    include: {
      jobListings: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { reviewer: { include: { user: { select: { name: true } } } } },
      },
    },
  })
  if (!company) notFound()

  const avgRating =
    company.reviews.length > 0
      ? (company.reviews.reduce((s, r) => s + r.rating, 0) / company.reviews.length).toFixed(1)
      : null

  let canReview = false
  let alreadyReviewed = false

  if (session?.user?.id && session.user.role === "INTERVIEWEE") {
    canReview = true
    // check for existing review (profile may not exist yet — that's fine, action will upsert it)
    const profile = await prisma.intervieweeProfile.findUnique({ where: { userId: session.user.id } })
    if (profile) {
      const existing = await prisma.companyReview.findFirst({ where: { companyId: id, reviewerId: profile.id } })
      alreadyReviewed = !!existing
    }
  }

  const reviewAction: (fd: FormData) => Promise<{ error?: string }> = submitReview.bind(null, id)

  // Serialize reviews for client (dates to strings)
  const serializedReviews = company.reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    department: r.department,
    createdAt: r.createdAt.toISOString(),
    reviewer: { user: { name: r.reviewer.user.name } },
  }))

  const serializedJobs = company.jobListings.map(j => ({
    id: j.id,
    title: j.title,
    location: j.location,
    workType: j.workType as string,
    payRangeFrom: j.payRangeFrom,
    payRangeTo: j.payRangeTo,
  }))

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <Navbar />

      {/* Banner — shorter on mobile */}
      <div className="h-[90px] md:h-[130px] w-full shrink-0"
        style={{ background: "linear-gradient(120deg, #FFF7ED 0%, #FFEAD3 60%, #FFE0C2 100%)" }} />

      <main className="flex-1 max-w-5xl mx-auto w-full">
        <CompanyProfileClient
          company={{
            id: company.id,
            companyName: company.companyName,
            logoUrl: company.logoUrl,
            description: company.description,
            website: company.website,
            linkedinUrl: company.linkedinUrl,
          }}
          reviews={serializedReviews}
          jobs={serializedJobs}
          avgRating={avgRating}
          canReview={canReview}
          alreadyReviewed={alreadyReviewed}
          reviewAction={reviewAction}
        />
      </main>

      <Footer />
    </div>
  )
}
