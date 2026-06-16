import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveSkills } from "@/app/actions/onboarding"
import TechSkillSelector from "@/components/tech-skill-selector"

export default function SkillsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-2xl px-4">
        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Your tech skills</CardTitle>
            <CardDescription>Select the technologies you work with and your experience level</CardDescription>
          </CardHeader>
          <CardContent>
            <TechSkillSelector
              onSave={saveSkills}
              redirectAfter="/onboarding/resume"
              showSkip
              skipTo="/onboarding/resume"
              submitLabel="Continue"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
