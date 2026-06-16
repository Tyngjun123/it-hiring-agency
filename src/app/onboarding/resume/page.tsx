"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveResumeUrl } from "@/app/actions/onboarding"
import { supabase } from "@/lib/supabase"

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleUpload() {
    if (!file) return router.push("/onboarding/complete")
    setUploading(true)
    setError("")

    const ext = file.name.split(".").pop()
    const fileName = `${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setError("Upload failed. Please try again.")
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("resumes").getPublicUrl(fileName)
    await saveResumeUrl(data.publicUrl)
    router.push("/onboarding/complete")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Upload your resume</CardTitle>
            <CardDescription>PDF or Word document, max 5MB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500">Click to select file</p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX</p>
                </div>
              )}
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? "Uploading…" : file ? "Upload & Continue" : "Continue without resume"}
            </Button>

            <button
              type="button"
              onClick={() => router.push("/onboarding/complete")}
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
