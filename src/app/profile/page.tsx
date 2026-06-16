import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { updateIntervieweeProfile } from "@/app/actions/profile"
import { replaceSkills } from "@/app/actions/profile"
import TechSkillSelector from "@/components/tech-skill-selector"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>
}) {
  const { saved } = await searchParams
  const session = await auth()

  const profile = await prisma.intervieweeProfile.findUnique({
    where: { userId: session!.user!.id! },
    include: { techSkills: true, user: { select: { name: true, email: true } } },
  })

  const user = profile?.user ?? { name: "", email: session!.user!.email ?? "" }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visible to companies when you apply</p>
        </div>

        {saved === "1" && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            Profile saved successfully.
          </div>
        )}

        {/* Basic info */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Info</h2>
          <form action={updateIntervieweeProfile} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} placeholder="Your full name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} placeholder="e.g. 0123456789" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="whatsappNumber">WhatsApp number</Label>
              <Input id="whatsappNumber" name="whatsappNumber" defaultValue={profile?.whatsappNumber ?? ""} placeholder="e.g. 60123456789" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" name="linkedinUrl" defaultValue={profile?.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <Button type="submit" className="w-full">Save changes</Button>
          </form>
        </div>

        {/* Resume */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Resume</h2>
          {profile?.resumeUrl ? (
            <div className="flex items-center justify-between">
              <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">
                View current resume →
              </a>
              <Link href="/onboarding/resume" className="text-sm text-gray-400 hover:text-gray-600">
                Replace
              </Link>
            </div>
          ) : (
            <Link href="/onboarding/resume">
              <Button variant="outline" className="w-full">Upload resume</Button>
            </Link>
          )}
        </div>

        {/* Tech skills */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Tech Skills</h2>
          <TechSkillSelector
            existing={profile?.techSkills.map((s) => ({ language: s.language, yearsExp: s.yearsExp })) ?? []}
            onSave={replaceSkills}
            submitLabel="Save skills"
          />
        </div>

      </main>
    </div>
  )
}
