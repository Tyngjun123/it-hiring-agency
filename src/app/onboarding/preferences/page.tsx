"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveJobPreferences } from "@/app/actions/onboarding"

const JOB_TYPES = [
  { value: "PROJECT_COORDINATOR", label: "Project Coordinator" },
  { value: "BUSINESS_ANALYST", label: "Business Analyst" },
  { value: "QUALITY_ASSURANCE", label: "Quality Assurance" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "APPLICATION_SYSTEM_SUPPORT", label: "Application System Support" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "BACKEND_DEVELOPER", label: "Backend Developer" },
  { value: "FRONTEND_DEVELOPER", label: "Frontend Developer" },
  { value: "FULLSTACK_DEVELOPER", label: "Fullstack Developer" },
  { value: "EXPLORING", label: "New — Still Exploring" },
]

export default function PreferencesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : prev.length < 3
        ? [...prev, value]
        : prev
    )
  }

  async function handleContinue() {
    if (selected.length === 0) return
    setLoading(true)
    await saveJobPreferences(selected)

    const hasDev = selected.some((s) =>
      ["BACKEND_DEVELOPER", "FRONTEND_DEVELOPER", "FULLSTACK_DEVELOPER"].includes(s)
    )
    router.push(hasDev ? "/onboarding/skills" : "/onboarding/resume")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg px-4">
        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">What type of role are you looking for?</CardTitle>
            <CardDescription>Pick up to 3</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {JOB_TYPES.map((type) => {
                const isSelected = selected.includes(type.value)
                const isDisabled = !isSelected && selected.length >= 3
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggle(type.value)}
                    disabled={isDisabled}
                    className={`py-2.5 px-3 rounded-lg border text-sm text-left transition-colors ${
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : isDisabled
                        ? "border-gray-100 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {type.label}
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-gray-400 text-center">
              {selected.length}/3 selected
            </p>

            <Button
              onClick={handleContinue}
              disabled={selected.length === 0 || loading}
              className="w-full"
            >
              {loading ? "Saving…" : "Continue"}
            </Button>

            <button
              type="button"
              onClick={() => router.push("/onboarding/resume")}
              className="w-full text-sm text-gray-400 hover:text-gray-600"
            >
              Skip for now
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
