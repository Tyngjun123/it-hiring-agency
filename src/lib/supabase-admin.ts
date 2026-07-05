import "server-only"
import { createClient } from "@supabase/supabase-js"

// Service-role Supabase client — SERVER ONLY. Full storage access, bypasses RLS.
// Never import this into a client component.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

export const RESUME_BUCKET = "resumes"
