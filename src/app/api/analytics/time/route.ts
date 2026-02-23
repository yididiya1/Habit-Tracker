import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, subDays, startOfWeek, startOfMonth, format } from "date-fns"

export type Period = "daily" | "weekly" | "monthly" | "all"

function getStartDate(period: Period): Date | null {
  const now = new Date()
  switch (period) {
    case "daily":
      return startOfDay(now)
    case "weekly":
      return startOfWeek(now, { weekStartsOn: 1 })
    case "monthly":
      return startOfMonth(now)
    case "all":
      return null
  }
}

// GET /api/analytics/time?period=daily|weekly|monthly|all
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const period = (req.nextUrl.searchParams.get("period") ?? "weekly") as Period
  const startDate = getStartDate(period)

  const logs = await prisma.habitLog.findMany({
    where: {
      userId: session.user.id,
      duration: { gt: 0 },
      ...(startDate ? { date: { gte: startDate } } : {}),
    },
    include: { habit: { select: { name: true, category: true, color: true } } },
    orderBy: { date: "asc" },
  })

  // --- Bar chart data: group by date then habit ---
  const dateMap: Record<string, Record<string, number>> = {}
  const habitMeta: Record<string, { name: string; color: string; category: string }> = {}

  for (const log of logs) {
    const dateKey = format(log.date, "MMM d")
    if (!dateMap[dateKey]) dateMap[dateKey] = {}
    dateMap[dateKey][log.habit.name] =
      (dateMap[dateKey][log.habit.name] ?? 0) + (log.duration ?? 0)
    habitMeta[log.habit.name] = {
      name: log.habit.name,
      color: log.habit.color,
      category: log.habit.category,
    }
  }

  const barData = Object.entries(dateMap).map(([date, habits]) => ({
    date,
    ...habits,
  }))

  // --- Category breakdown ---
  const categoryMap: Record<string, number> = {}
  for (const log of logs) {
    const cat = log.habit.category
    categoryMap[cat] = (categoryMap[cat] ?? 0) + (log.duration ?? 0)
  }

  const categoryData = Object.entries(categoryMap)
    .map(([category, minutes]) => ({ category, minutes }))
    .sort((a, b) => b.minutes - a.minutes)

  // --- Per-habit totals ---
  const habitTotals = Object.entries(
    logs.reduce<Record<string, { minutes: number; color: string; category: string }>>(
      (acc, log) => {
        const name = log.habit.name
        if (!acc[name])
          acc[name] = { minutes: 0, color: log.habit.color, category: log.habit.category }
        acc[name].minutes += log.duration ?? 0
        return acc
      },
      {}
    )
  )
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.minutes - a.minutes)

  return NextResponse.json({
    barData,
    habitMeta,
    categoryData,
    habitTotals,
    totalMinutes: logs.reduce((s, l) => s + (l.duration ?? 0), 0),
  })
}
