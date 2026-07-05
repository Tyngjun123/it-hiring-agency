export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateIntervieweeProfile } from "@/app/actions/profile"
import { replaceSkills } from "@/app/actions/profile"
import TechSkillSelector from "@/components/tech-skill-selector"
import ResumeSection from "@/components/resume-section"
import PhoneInput from "@/components/phone-input"
import CollapsibleCard from "@/components/collapsible-card"
import PreferredRolesSection from "@/components/preferred-roles-section"
import SaveJobButton from "@/components/save-job-button"
import { JOB_TYPE_LABELS } from "@/data/tech-skills"

function getInitials(name: string | null | undefined) {
  if (!name) return "?"
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; tab?: string }>
}) {
  const { saved, tab } = await searchParams
  const session = await auth()

  const profile = await prisma.intervieweeProfile.findUnique({
    where: { userId: session!.user!.id! },
    include: {
      techSkills: true,
      jobPreferences: { orderBy: { order: "asc" } },
      savedJobs: {
        orderBy: { createdAt: "desc" },
        include: {
          jobListing: {
            include: { company: { select: { companyName: true } } },
          },
        },
      },
      user: { select: { name: true, email: true } },
    },
  })

  const preferredRoles = profile?.jobPreferences.map((p) => p.jobType) ?? []
  const savedJobs = profile?.savedJobs ?? []

  const user = profile?.user ?? { name: "", email: session!.user!.email ?? "" }
  const initials = getInitials(user.name)
  const isEditing = tab === "edit"

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {saved === "1" && (
          <div className="mb-5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-3 text-sm text-[#047857] font-medium">
            Profile saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5 items-start">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-4">

            {/* Avatar + info card */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 text-center shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <div className="w-20 h-20 rounded-full bg-[#FFF7ED] border-[3px] border-[#FCE4CB] flex items-center justify-center text-[#C2410C] font-extrabold text-2xl mx-auto mb-3">
                {initials}
              </div>
              <p className="text-[19px] font-extrabold text-[#1C1C1E] tracking-tight">{user.name || "Your Name"}</p>
              <p className="text-sm text-[#6B7280] mt-1">{user.email}</p>
              {profile?.phone && (
                <p className="text-xs text-[#9CA3AF] mt-0.5">{profile.phone}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Link href={isEditing ? "/profile" : "/profile?tab=edit"}
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold py-2.5 rounded-[11px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] transition-colors text-center">
                  {isEditing ? "← Back" : "Edit profile"}
                </Link>
                {profile?.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="w-10 border border-[#E6E2D9] rounded-[11px] flex items-center justify-center text-[#6B7280] hover:text-[#0A66C2] hover:border-[#0A66C2] transition-colors text-xs font-bold">
                    in
                  </a>
                )}
              </div>

              {/* Preferred roles — collapsible, set during onboarding · read-only */}
              <PreferredRolesSection roles={preferredRoles.map((jt) => JOB_TYPE_LABELS[jt] ?? jt)} />
            </div>

            {/* Edit form — shown when tab=edit */}
            {isEditing && (
              <div className="bg-white border border-[#EEEBE3] rounded-2xl p-5 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
                <p className="text-sm font-bold text-[#1C1C1E] mb-4">Basic Info</p>
                <form action={updateIntervieweeProfile} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs text-[#6B7280]">Full name</Label>
                    <Input id="name" name="name" defaultValue={user.name ?? ""} placeholder="Your full name"
                      className="text-sm border-[#E6E2D9] focus:border-[#F97316] rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs text-[#6B7280]">Phone / WhatsApp</Label>
                    <PhoneInput name="phone" defaultValue={profile?.phone ?? ""} placeholder="0123456789"
                      className="w-full text-sm border border-[#E6E2D9] focus:border-[#F97316] rounded-xl px-3 py-2 focus:outline-none" />
                    <p className="text-[11px] text-[#9CA3AF]">Digits only. Used as your WhatsApp contact too.</p>
                  </div>

                  <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider pt-1">Social links</p>

                  <div className="space-y-1">
                    <Label htmlFor="linkedinUrl" className="text-xs text-[#6B7280]">LinkedIn</Label>
                    <Input id="linkedinUrl" name="linkedinUrl" defaultValue={profile?.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/..."
                      className="text-sm border-[#E6E2D9] focus:border-[#F97316] rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="facebookUrl" className="text-xs text-[#6B7280]">Facebook</Label>
                    <Input id="facebookUrl" name="facebookUrl" defaultValue={profile?.facebookUrl ?? ""} placeholder="https://facebook.com/..."
                      className="text-sm border-[#E6E2D9] focus:border-[#F97316] rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="instagramUrl" className="text-xs text-[#6B7280]">Instagram</Label>
                    <Input id="instagramUrl" name="instagramUrl" defaultValue={profile?.instagramUrl ?? ""} placeholder="https://instagram.com/..."
                      className="text-sm border-[#E6E2D9] focus:border-[#F97316] rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rednoteUrl" className="text-xs text-[#6B7280]">Rednote (小红书)</Label>
                    <Input id="rednoteUrl" name="rednoteUrl" defaultValue={profile?.rednoteUrl ?? ""} placeholder="https://xiaohongshu.com/..."
                      className="text-sm border-[#E6E2D9] focus:border-[#F97316] rounded-xl" />
                  </div>

                  <button type="submit"
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold py-2.5 rounded-[11px] transition-colors mt-1">
                    Save changes
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">

            {/* Resume / CV */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <p className="text-base font-bold text-[#1C1C1E] mb-4">Resume / CV</p>
              <ResumeSection resumeUrl={profile?.resumeUrl} />
            </div>

            {/* Tech skills — collapsible */}
            <CollapsibleCard
              title="Tech Skills"
              count={profile?.techSkills.length ?? 0}
              description="Tap to add the tools and domains you work with."
            >
              <TechSkillSelector
                existing={profile?.techSkills.map((s) => ({ language: s.language, yearsExp: s.yearsExp })) ?? []}
                onSave={replaceSkills}
                submitLabel="Save skills"
              />
            </CollapsibleCard>

            {/* Saved jobs — bookmarked listings, collapsible */}
            <CollapsibleCard
              title="Saved Jobs"
              count={savedJobs.length}
              countLabel="saved"
              description="Jobs you bookmarked to apply later."
            >
              {savedJobs.length > 0 ? (
                <div className="space-y-2.5">
                  {savedJobs.map((s) => {
                    const j = s.jobListing
                    const company = j.hideCompanyInfo ? "Confidential" : j.company.companyName
                    return (
                      <div key={s.id} className="flex items-center gap-3 border border-[#F0EEE8] rounded-[12px] px-3.5 py-3">
                        <Link href={`/jobs/${j.id}`} className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-[#1C1C1E] truncate hover:text-[#F97316] transition-colors">{j.title}</p>
                          <p className="text-[12.5px] text-[#9CA3AF] truncate">{company}{j.location ? ` · ${j.location}` : ""}</p>
                        </Link>
                        <SaveJobButton jobId={j.id} initialSaved />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-[#9CA3AF]">No saved jobs yet. Tap the bookmark on any job to save it.</p>
              )}
            </CollapsibleCard>

          </div>
        </div>
      </main>
    </div>
  )
}
