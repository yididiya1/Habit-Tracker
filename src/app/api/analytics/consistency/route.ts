import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { eachDayOfInterval, subDays, startOfDay, format } from "date-fns"

// GET /api/analytics/consistency?days=90
// Returns per-day completion % for the heatmap
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "90", 10)
  const today = startOfDay(new Date())
  const start = subDays(today, days - 1)

  const [logs, habitCount] = await Promise.all([
    prisma.habitLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: start },
      },
      select: { date: true, completed: true, duration: true },
    }),
    prisma.habit.count({
      where: { userId: session.user.id, archived: false },
    }),
  ])

  if (habitCount === 0) {
    return NextResponse.json([])
  }

  // Group logs by date
  const logsByDate: Record<string, { completed: number; total: number }> = {}

  for (const log of logs) {
    const key = format(log.date, "yyyy-MM-dd")
    if (!logsByDate[key]) logsByDate[key] = { completed: 0, total: 0 }
    logsByDate[key].total += 1
    if (log.completed || (log.duration ?? 0) > 0) {
      logsByDate[key].completed += 1
    }
  }

  // Fill every day in the range
  const allDays = eachDayOfInterval({ start, end: today })
  const result = allDays.map((day) => {
    const key = format(day, "yyyy-MM-dd")
    const entry = logsByDate[key]
    const pct = entry ? Math.round((entry.completed / habitCount) * 100) : 0
    return {
      date: key,
      pct,
      completed: entry?.completed ?? 0,
      total: habitCount,
    }
  })

  return NextResponse.json(result)
}
