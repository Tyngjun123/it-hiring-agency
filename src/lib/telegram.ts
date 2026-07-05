import { getSiteUrl } from "@/lib/site-url"

// Posts a published blog post to the configured Telegram channel.
// No-ops safely if env is unset or the API call fails — publishing must never
// break because Telegram is down.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHANNEL = process.env.TELEGRAM_CHANNEL_ID // e.g. "@ITjobfindhere"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function truncate(s: string, max: number): string {
  const t = s.trim()
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + "…"
}

type TelegramBlogPost = {
  slug: string
  title: string
  summary: string
  coverImageUrl?: string | null
}

export async function postBlogToTelegram(post: TelegramBlogPost): Promise<void> {
  if (!TOKEN || !CHANNEL) return // feature disabled — skip silently

  const url = `${getSiteUrl()}/blog/${post.slug}`
  // sendPhoto caption cap is 1024; keep summary short to be safe.
  const body =
    `📢 <b>${escapeHtml(post.title)}</b>\n\n` +
    `${escapeHtml(truncate(post.summary, 600))}\n\n` +
    `👉 <a href="${url}">Read the full article</a>`

  try {
    const endpoint = post.coverImageUrl ? "sendPhoto" : "sendMessage"
    const payload: Record<string, unknown> = post.coverImageUrl
      ? { chat_id: CHANNEL, photo: post.coverImageUrl, caption: body, parse_mode: "HTML" }
      : { chat_id: CHANNEL, text: body, parse_mode: "HTML", disable_web_page_preview: false }

    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error(`Telegram post failed (${res.status}):`, detail)
    }
  } catch (err) {
    console.error("Telegram post threw:", err)
  }
}
