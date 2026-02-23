import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTodayDate } from "@/lib/utils"

// PATCH /api/today/[habitId] — upsert today's log for a habit
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { habitId } = await params
  const body = await req.json()

  // Verify the habit belongs to this user
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id, archived: false },
    select: { id: true, type: true, targetCount: true },
  })
  if (!habit) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 })
  }

  const today = getTodayDate()

  // Fetch existing log to accumulate duration and count
  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId, date: today } },
    select: { duration: true, count: true },
  })

  const newDuration =
    body.duration !== undefined
      ? (existing?.duration ?? 0) + body.duration
      : undefined

  const newCount =
    body.count !== undefined
      ? Math.max(0, (existing?.count ?? 0) + body.count)
      : undefined

  // Auto-complete COUNT habits when target is met
  let resolvedCompleted = body.completed
  if (habit.type === "COUNT" && newCount !== undefined && habit.targetCount) {
    resolvedCompleted = newCount >= habit.targetCount
  }

  const log = await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date: today } },
    create: {
      habitId,
      userId: session.user.id,
      date: today,
      completed: resolvedCompleted ?? false,
      duration: body.duration ?? null,
      count: body.count ?? null,
      note: body.note ?? null,
    },
    update: {
      ...(resolvedCompleted !== undefined && { completed: resolvedCompleted }),
      ...(newDuration !== undefined && { duration: newDuration }),
      ...(newCount !== undefined && { count: newCount }),
      ...(body.note !== undefined && { note: body.note }),
    },
  })

  return NextResponse.json(log)
}
