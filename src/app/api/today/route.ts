import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTodayDate } from "@/lib/utils"

// GET /api/today — habits with their log for today
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = getTodayDate()
  const todayDow = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
    new Date().getDay()
  ]

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, archived: false },
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        where: { date: today },
        take: 1,
      },
    },
  })

  const result = habits
    .filter(
      (h) => h.scheduleDays.length === 0 || h.scheduleDays.includes(todayDow)
    )
    .map((habit) => ({
      ...habit,
      log: habit.logs[0] ?? null,
      logs: undefined,
    }))

  return NextResponse.json(result)
}
