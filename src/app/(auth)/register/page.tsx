import { redirect } from "next/navigation"

// Standardized: registration is a popup over the homepage, not a standalone page.
// Forwards a ?role= hint (e.g. from the pricing page) so the modal opens on the right tab.
export default async function RegisterRedirect({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  const r = role?.toLowerCase()
  const roleQuery = r === "company" || r === "interviewee" ? `&role=${r}` : ""
  redirect(`/?auth=register${roleQuery}`)
}
