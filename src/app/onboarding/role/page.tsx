"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setUserRole } from "@/app/actions/onboarding"

export default function RoleSelectionPage() {
  const [role, setRole] = useState<"INTERVIEWEE" | "COMPANY" | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  async function handleContinue() {
    if (!role) return
    setLoading(true)
    await setUserRole(role)
    // Refresh the JWT so the new role is in the session cookie before we navigate.
    // The company layout checks session.user.role === "COMPANY", so we must update first.
    await update()
    router.push(role === "COMPANY" ? "/company/setup" : "/onboarding/preferences")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to IT Hire</CardTitle>
            <CardDescription>How will you be using the platform?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setRole("INTERVIEWEE")}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  role === "INTERVIEWEE"
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <p className="font-medium text-gray-900">I&apos;m looking for a job</p>
                <p className="text-sm text-gray-500 mt-0.5">Browse listings and apply to IT positions</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("COMPANY")}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  role === "COMPANY"
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <p className="font-medium text-gray-900">I&apos;m hiring</p>
                <p className="text-sm text-gray-500 mt-0.5">Post jobs and find IT talent</p>
              </button>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!role || loading}
              className="w-full"
            >
              {loading ? "Saving…" : "Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
