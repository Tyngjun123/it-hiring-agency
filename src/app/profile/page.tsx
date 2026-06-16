import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateIntervieweeProfile } from "@/app/actions/profile"
import { replaceSkills } from "@/app/actions/profile"
import TechSkillSelector from "@/components/tech-skill-selector"

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
    include: { techSkills: true, user: { select: { name: true, email: true } } },
  })

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
                    <Label htmlFor="phone" className="text-xs text-[#6B7280]">Phone</Label>
                    <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} placeholder="0123456789"
                      className="text-sm border-[#E6E2D9] focus:border-[#F97316] rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="whatsappNumber" className="text-xs text-[#6B7280]">WhatsApp</Label>
                    <Input id="whatsappNumber" name="whatsappNumber" defaultValue={profile?.whatsappNumber ?? ""} placeholder="60123456789"
                      className="text-sm border-[#E6E2D9] focus:border-[#F97316] rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="linkedinUrl" className="text-xs text-[#6B7280]">LinkedIn URL</Label>
                    <Input id="linkedinUrl" name="linkedinUrl" defaultValue={profile?.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/..."
                      className="text-sm border-[#E6E2D9] focus:border-[#F97316] rounded-xl" />
                  </div>
                  <button type="submit"
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold py-2.5 rounded-[11px] transition-colors">
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

              {/* Drop zone */}
              <Link href="/onboarding/resume"
                className="block border-2 border-dashed border-[#F7C99A] bg-[#FFFBF5] rounded-xl p-6 text-center hover:border-[#F97316] transition-colors">
                <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] flex items-center justify-center mx-auto mb-3 text-[#F97316] text-xl">
                  ↑
                </div>
                <p className="text-sm font-bold text-[#1C1C1E]">
                  Drop your CV here, or <span className="text-[#F97316]">browse</span>
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">PDF or DOCX, up to 5 MB</p>
              </Link>

              {/* Existing resume */}
              {profile?.resumeUrl && (
                <div className="flex items-center justify-between mt-3 bg-[#F6F4EE] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[9px] bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-[10px] font-extrabold">
                      PDF
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1C1C1E]">Resume.pdf</p>
                      <p className="text-xs text-[#9CA3AF]">Uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold text-[#F97316] hover:underline">View</a>
                    <Link href="/onboarding/resume" className="text-xs font-bold text-[#DC2626] hover:underline">
                      Replace
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Tech skills */}
            <div className="bg-white border border-[#EEEBE3] rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,28,30,0.03),0_10px_26px_rgba(28,28,30,0.05)]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-base font-bold text-[#1C1C1E]">Tech Skills</p>
                <span className="text-xs text-[#9CA3AF]">
                  <span className="text-[#F97316] font-bold">{profile?.techSkills.length ?? 0}</span> selected
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mb-5">Tap to add the tools and domains you work with.</p>
              <TechSkillSelector
                existing={profile?.techSkills.map((s) => ({ language: s.language, yearsExp: s.yearsExp })) ?? []}
                onSave={replaceSkills}
                submitLabel="Save skills"
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
