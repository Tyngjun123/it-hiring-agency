import "server-only"
import crypto from "crypto"
import { getSiteUrl } from "@/lib/site-url"

const SANDBOX = process.env.BILLPLZ_SANDBOX === "true"
const BASE = SANDBOX ? "https://www.billplz-sandbox.com/api" : "https://www.billplz.com/api"
const API_KEY = process.env.BILLPLZ_API_KEY
const XSIGN = process.env.BILLPLZ_XSIGN_KEY
const COLLECTION = process.env.BILLPLZ_COLLECTION_ID

export function billplzConfigured(): boolean {
  return !!(API_KEY && XSIGN && COLLECTION)
}

// Creates a Billplz bill and returns the hosted payment URL to redirect to.
export async function createBill(opts: {
  amountRM: number
  name: string
  email: string
  description: string
  reference?: string // our Payment id, echoed back on the bill
}): Promise<{ id: string; url: string } | { error: string }> {
  if (!API_KEY || !COLLECTION) return { error: "Billplz not configured" }
  const site = getSiteUrl()
  const body = new URLSearchParams({
    collection_id: COLLECTION,
    email: opts.email,
    name: opts.name,
    amount: String(Math.round(opts.amountRM * 100)), // cents
    description: opts.description.slice(0, 200),
    callback_url: `${site}/api/billplz/callback`,
    redirect_url: `${site}/company/billing?billplz=return`,
    ...(opts.reference ? { reference_1_label: "PaymentId", reference_1: opts.reference } : {}),
  })
  try {
    const res = await fetch(`${BASE}/v3/bills`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${API_KEY}:`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.id || !data?.url) {
      console.error("Billplz createBill failed:", res.status, data)
      return { error: "Could not start payment. Please try again." }
    }
    return { id: data.id, url: data.url }
  } catch (err) {
    console.error("Billplz createBill threw:", err)
    return { error: "Could not reach the payment gateway." }
  }
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb)
}

// Verifies the webhook (callback) X-Signature: all params except x_signature,
// keys sorted ascending case-insensitive, each "key"+"value", joined by "|".
export function verifyCallbackSignature(params: Record<string, string>): boolean {
  if (!XSIGN || !params.x_signature) return false
  const source = Object.keys(params)
    .filter((k) => k !== "x_signature")
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}${params[k]}`)
    .join("|")
  const computed = crypto.createHmac("sha256", XSIGN).update(source).digest("hex")
  return safeEqual(computed, params.x_signature)
}

// Verifies the browser redirect params: billplz[id], billplz[paid], etc. The
// signed keys drop the brackets (billplz[id] -> billplzid).
export function verifyRedirectSignature(params: Record<string, string>): boolean {
  const sig = params["billplz[x_signature]"]
  if (!XSIGN || !sig) return false
  const source = Object.keys(params)
    .filter((k) => k.startsWith("billplz[") && k !== "billplz[x_signature]")
    .map((k) => [k.replace(/^billplz\[(.+)\]$/, "billplz$1"), params[k]] as [string, string])
    .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()))
    .map(([k, v]) => `${k}${v}`)
    .join("|")
  const computed = crypto.createHmac("sha256", XSIGN).update(source).digest("hex")
  return safeEqual(computed, sig)
}
