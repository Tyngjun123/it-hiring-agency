"use client"

import { useEffect, useRef, useState } from "react"

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// Renders a résumé PDF page-by-page onto <canvas> (so there's no downloadable
// PDF or native download button) with a tiled, semi-transparent watermark
// identifying the viewing company — the traceability deterrent.
export default function ResumeWatermarkViewer({
  url,
  watermark,
}: {
  url: string
  watermark: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading")

  useEffect(() => {
    let cancelled = false
    const container = ref.current
    if (!container) return
    const el = container // const narrows to non-null across awaits

    const wmSvg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='190'>` +
      `<text x='16' y='105' fill='rgba(17,17,17,0.13)' font-size='15' font-weight='bold' ` +
      `font-family='Arial, sans-serif' transform='rotate(-28 180 95)'>${escapeXml(watermark)}</text></svg>`
    const wmBg = `url("data:image/svg+xml,${encodeURIComponent(wmSvg)}")`

    async function render() {
      try {
        // Import pdf.js in the browser only (it touches browser globals).
        const pdfjsLib = await import("pdfjs-dist")
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

        const pdf = await pdfjsLib.getDocument({ url }).promise
        if (cancelled) return
        el.innerHTML = ""

        const maxW = Math.min(820, window.innerWidth - 32)
        for (let n = 1; n <= pdf.numPages; n++) {
          if (cancelled) return
          const page = await pdf.getPage(n)
          const base = page.getViewport({ scale: 1 })
          const scale = Math.max(1, maxW / base.width) * (window.devicePixelRatio || 1)
          const viewport = page.getViewport({ scale })

          const canvas = document.createElement("canvas")
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = "100%"
          canvas.style.height = "auto"
          canvas.style.display = "block"

          const wrap = document.createElement("div")
          wrap.style.cssText =
            "position:relative;margin:0 auto 16px;max-width:820px;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.12)"
          wrap.appendChild(canvas)

          const wm = document.createElement("div")
          wm.style.cssText = `position:absolute;inset:0;pointer-events:none;background-image:${wmBg};background-repeat:repeat`
          wrap.appendChild(wm)
          el.appendChild(wrap)

          await page.render({ canvas, viewport }).promise
        }
        if (!cancelled) setStatus("done")
      } catch (err) {
        console.error("Résumé render failed:", err)
        if (!cancelled) setStatus("error")
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [url, watermark])

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="select-none"
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {status === "loading" && (
        <p className="text-center text-sm text-[#9CA3AF] py-10">Loading résumé…</p>
      )}
      {status === "error" && (
        <p className="text-center text-sm text-[#DC2626] py-10">
          Could not load this résumé. It may have been removed.
        </p>
      )}
      <div ref={ref} />
    </div>
  )
}
