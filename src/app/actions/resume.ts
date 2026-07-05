"use server"

import { randomUUID } from "crypto"
import { auth } from "@/auth"
import { supabaseAdmin, RESUME_BUCKET } from "@/lib/supabase-admin"

// Returns a one-time signed upload URL for a private résumé file.
// The client uploads directly to Supabase with this — the file never routes
// through our server, and the bucket can stay private.
export async function createResumeUploadUrl(ext: string): Promise<
  { path: string; token: string } | { error: string }
> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const safeExt = (ext || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "pdf"
  const path = `${session.user.id}/${randomUUID()}.${safeExt}`

  const { data, error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .createSignedUploadUrl(path)

  if (error || !data) return { error: "Could not start upload. Please try again." }
  return { path: data.path, token: data.token }
}

// Resolves a stored résumé reference to a short-lived viewable URL.
// Handles both new private paths and legacy public URLs.
export async function getResumeViewUrl(stored: string | null | undefined): Promise<
  { url: string } | { error: string }
> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  if (!stored) return { error: "No résumé" }

  // Legacy résumés were stored as full public URLs. Extract the storage path
  // and sign it so they keep working even after the bucket is made private.
  let path = stored
  if (stored.startsWith("http")) {
    const marker = "/public/resumes/"
    const idx = stored.indexOf(marker)
    if (idx === -1) return { url: stored } // unknown format — return as-is
    path = decodeURIComponent(stored.slice(idx + marker.length))
  }

  const { data, error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(path, 300) // 5 minutes

  if (error || !data) return { error: "Could not load résumé." }
  return { url: data.signedUrl }
}
