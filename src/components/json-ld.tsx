// Renders structured data as a <script type="application/ld+json"> tag.
// Crawlers read JSON-LD from anywhere in the document, so these render in the
// page body (no need to inject into <head>).

// Auto-generated schema from a plain object.
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Admin-pasted custom schema (a raw JSON string). Any wrapping <script> tags are
// stripped so the admin can paste either the bare JSON or a full script block.
// Rendered only if it contains something.
export function RawJsonLd({ json }: { json: string | null | undefined }) {
  if (!json) return null
  const inner = json.replace(/<\/?script[^>]*>/gi, "").trim()
  if (!inner) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: inner }} />
}
