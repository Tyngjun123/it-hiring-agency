import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyCallbackSignature, debugCallbackSignature } from "@/lib/billplz"
import { fulfillPayment } from "@/lib/fulfill-payment"

export const dynamic = "force-dynamic"

// Billplz payment webhook. Billplz POSTs form-encoded bill data with an
// x_signature we verify (HMAC-SHA256) before fulfilling the payment.
export async function POST(req: Request) {
  const form = await req.formData()
  const params: Record<string, string> = {}
  for (const [k, v] of form.entries()) params[k] = String(v)

  console.log("[billplz/callback] received", { id: params.id, paid: params.paid, state: params.state })

  if (!verifyCallbackSignature(params)) {
    // TEMP: log why the signature was rejected (no secret is printed).
    console.error("[billplz/callback] BAD SIGNATURE", debugCallbackSignature(params))
    return NextResponse.json({ ok: false, error: "bad signature" }, { status: 400 })
  }

  const paid = params.paid === "true" || params.state === "paid"
  if (paid && params.id) {
    const payment = await prisma.payment.findFirst({ where: { billplzBillId: params.id } })
    if (payment) await fulfillPayment(payment.id) // idempotent
  }

  // Always 200 on a valid signature so Billplz stops retrying.
  return NextResponse.json({ ok: true })
}
