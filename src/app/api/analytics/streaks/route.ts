import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calcStreaks } from "@/lib/streaks"
import { format } from "date-fns"

// GET /api/analytics/streaks — streaks for all habits (for dashboard stat)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, archived: false },
    include: {
      logs: {
        where: { OR: [{ completed: true }, { duration: { gt: 0 } }] },
        select: { date: true },
        orderBy: { date: "desc" },
      },
    },
  })

  const results = habits.map((habit) => {
    const dates = habit.logs.map((l) => format(l.date, "yyyy-MM-dd"))
    const streaks = calcStreaks(dates)
    return { id: habit.id, name: habit.name, color: habit.color, ...streaks }
  })

  // Best current streak across all habits
  const bestCurrent = results.reduce((max, h) => Math.max(max, h.current), 0)
  const bestLongest = results.reduce((max, h) => Math.max(max, h.longest), 0)

  return NextResponse.json({ habits: results, bestCurrent, bestLongest })
}
