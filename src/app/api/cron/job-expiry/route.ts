import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Closes ACTIVE jobs that are past their expiresAt, or have been active for 60+ days with no expiry set
const DEFAULT_EXPIRY_DAYS = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const defaultCutoff = new Date(now.getTime() - DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  const expired = await prisma.jobListing.updateMany({
    where: {
      status: "ACTIVE",
      OR: [
        { expiresAt: { lt: now, not: null } },
        { expiresAt: null, createdAt: { lt: defaultCutoff } },
      ],
    },
    data: { status: "CLOSED" },
  })

  return NextResponse.json({
    closed: expired.count,
    runAt: now.toISOString(),
  })
}
