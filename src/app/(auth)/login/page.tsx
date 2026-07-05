import { redirect } from "next/navigation"

// Standardized: sign-in is a popup over the homepage, not a standalone page.
export default async function LoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; callbackUrl?: string }>
}) {
  const { registered } = await searchParams
  redirect(registered ? "/?auth=login&registered=1" : "/?auth=login")
}
