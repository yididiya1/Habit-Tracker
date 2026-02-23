import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calcStreaks } from "@/lib/streaks"
import { eachDayOfInterval, subDays, startOfDay, format } from "date-fns"

// GET /api/habits/[id]/stats — streak + 90-day consistency for one habit
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.user.id, archived: false },
  })
  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const today = startOfDay(new Date())
  const start = subDays(today, 89) // 90 days inclusive

  const logs = await prisma.habitLog.findMany({
    where: { habitId: id, date: { gte: start } },
    select: { date: true, completed: true, duration: true },
    orderBy: { date: "asc" },
  })

  // Build completed date strings
  const completedDates = logs
    .filter((l) => l.completed || (l.duration ?? 0) > 0)
    .map((l) => format(l.date, "yyyy-MM-dd"))

  const streaks = calcStreaks(completedDates)

  // 90-day heatmap data
  const completedSet = new Set(completedDates)
  const allDays = eachDayOfInterval({ start, end: today })
  const heatmap = allDays.map((day) => {
    const key = format(day, "yyyy-MM-dd")
    return { date: key, done: completedSet.has(key) }
  })

  // Total completions and time
  const totalCompletions = completedDates.length
  const totalMinutes = logs.reduce((s, l) => s + (l.duration ?? 0), 0)

  return NextResponse.json({
    habit,
    streaks,
    heatmap,
    totalCompletions,
    totalMinutes,
  })
}
