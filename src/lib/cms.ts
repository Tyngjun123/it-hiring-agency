import { prisma } from "@/lib/prisma"

// Reads all editable CMS content into a key→value map. Fail-safe: returns an
// empty map (callers fall back to their hardcoded defaults) if the DB is down.
export async function getCmsMap(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.cmsContent.findMany()
    const map: Record<string, string> = {}
    for (const r of rows) map[r.key] = r.value
    return map
  } catch {
    return {}
  }
}
