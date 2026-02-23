import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTodayDate } from "@/lib/utils"

// GET /api/today/time-breakdown
// Returns ALL habits that have duration > 0 logged today, regardless of scheduleDays
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = getTodayDate()

  const logs = await prisma.habitLog.findMany({
    where: {
      userId: session.user.id,
      date: today,
      duration: { gt: 0 },
    },
    include: {
      habit: {
        select: {
          id: true,
          name: true,
          category: true,
          type: true,
          color: true,
          archived: true,
        },
      },
    },
    orderBy: { duration: "desc" },
  })

  const result = logs
    .filter((l) => !l.habit.archived)
    .map((l) => ({
      id: l.habit.id,
      name: l.habit.name,
      category: l.habit.category,
      type: l.habit.type,
      color: l.habit.color,
      duration: l.duration!,
    }))

  return NextResponse.json(result)
}
