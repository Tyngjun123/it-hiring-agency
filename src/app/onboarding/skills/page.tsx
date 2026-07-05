import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveSkills } from "@/app/actions/onboarding"
import TechSkillSelector from "@/components/tech-skill-selector"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { relevantCategoriesFor } from "@/data/tech-skills"

export default async function SkillsPage() {
  const session = await auth()

  // Determine which skill categories to show based on the seeker's job preferences
  let allowedCategories: string[] | null = null
  if (session?.user?.id) {
    const profile = await prisma.intervieweeProfile.findUnique({
      where: { userId: session.user.id },
      include: { jobPreferences: true },
    })
    const jobTypes = profile?.jobPreferences.map((p) => p.jobType as string) ?? []
    allowedCategories = relevantCategoriesFor(jobTypes)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-2xl px-4">
        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Your tech skills</CardTitle>
            <CardDescription>
              {allowedCategories
                ? "Skills relevant to the roles you picked — select what you work with"
                : "Select the technologies you work with and your experience level"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TechSkillSelector
              onSave={saveSkills}
              redirectAfter="/onboarding/resume"
              showSkip
              skipTo="/onboarding/resume"
              submitLabel="Continue"
              allowedCategories={allowedCategories}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
