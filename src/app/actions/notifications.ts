"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Mark a single notification read (ownership-checked).
export async function markNotificationRead(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  await prisma.notification.updateMany({
    where: { id, userId: session.user.id, read: false },
    data: { read: true },
  })
  revalidatePath("/notifications")
}

// Mark all of the current user's notifications read.
export async function markAllNotificationsRead() {
  const session = await auth()
  if (!session?.user?.id) return
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })
  revalidatePath("/notifications")
}
