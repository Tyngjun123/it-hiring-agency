import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@/generated/prisma/enums"

// Central entry point for in-app (🔔) notifications. Intentionally fail-safe:
// a notification write must NEVER break the action that triggered it (apply,
// status change, etc.) — so any error is swallowed and logged.
export async function createNotification(params: {
  userId: string
  type: NotificationType
  title: string
  body: string
  link: string
}) {
  try {
    await prisma.notification.create({ data: params })
  } catch (err) {
    console.error("[notify] failed to create notification", err)
  }
}
