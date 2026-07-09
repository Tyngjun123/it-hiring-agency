// Single source of truth for admin access control.

// Username -> email mapping for the credential-based admin login (/admin/login).
// Each entry is an admin. They all sign in with the ADMIN_PASSWORD env var.
export const ADMIN_USERNAMES: Record<string, string> = {
  admin: "tyngjun123@gmail.com",
  kahou123: "kahou123@ithire.my",
  cy: "cy@techirex.com",
}

// Optional extra admins via env (comma-separated emails), merged with the above.
const envEmails =
  process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean) ?? []

export const ADMIN_EMAILS: string[] = Array.from(
  new Set([...envEmails, ...Object.values(ADMIN_USERNAMES).map((e) => e.toLowerCase())])
)

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
