import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, subDays, format } from "date-fns"

type Params = { params: Promise<{ id: string }> }

// GET /api/groups/[id]/stats?days=30
export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId } = await params
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const url = new URL(req.url)
  const days = parseInt(url.searchParams.get("days") ?? "30")
  const since = startOfDay(subDays(new Date(), days - 1))

  const [members, habits, logs] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.groupHabit.findMany({ where: { groupId } }),
    prisma.groupHabitLog.findMany({
      where: { habit: { groupId }, date: { gte: since } },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    }),
  ])

  // ── Streak per member ────────────────────────────────────────────────────────
  const today = startOfDay(new Date())
  const streaks = members.map((m) => {
    const userLogs = logs
      .filter((l) => l.userId === m.userId && l.completed)
      .map((l) => format(l.date, "yyyy-MM-dd"))
      .sort()
      .reverse()

    let streak = 0
    let cursor = today
    for (const dateStr of userLogs) {
      const expected = format(cursor, "yyyy-MM-dd")
      if (dateStr === expected) {
        streak++
        cursor = subDays(cursor, 1)
      } else if (dateStr < expected) {
        break
      }
    }
    return { userId: m.userId, name: m.user.name, image: m.user.image, streak }
  })

  // ── Weekly completions per member (last 7 days) ──────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i)
    return format(d, "yyyy-MM-dd")
  })

  // Map habitId → type so we can show raw count/duration instead of 0/1
  const habitTypeMap = new Map(habits.map((h) => [h.id, h.type]))

  const weeklyData = last7.map((dateStr) => {
    const entry: Record<string, string | number> = { date: dateStr }
    members.forEach((m) => {
      const dayLogs = logs.filter(
        (l) => l.userId === m.userId && format(l.date, "yyyy-MM-dd") === dateStr
      )
      const value = dayLogs.reduce((sum, l) => {
        const type = habitTypeMap.get(l.habitId)
        if (type === "COUNT") return sum + (l.count ?? 0)
        if (type === "TIMER") return sum + (l.duration ?? 0)
        return sum + (l.completed ? 1 : 0)
      }, 0)
      entry[m.user.name ?? m.userId] = value
    })
    return entry
  })

  // ── Consistency % per member ─────────────────────────────────────────────────
  const consistency = members.map((m) => {
    const total = days
    const completed = logs.filter((l) => l.userId === m.userId && l.completed).length
    return {
      userId: m.userId,
      name: m.user.name,
      image: m.user.image,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
    }
  })

  // ── Heatmap per member (raw daily completions) ───────────────────────────────
  const heatmap = members.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    image: m.user.image,
    days: logs
      .filter((l) => l.userId === m.userId)
      .map((l) => ({ date: format(l.date, "yyyy-MM-dd"), completed: l.completed })),
  }))

  return NextResponse.json({
    members: members.map((m) => ({ ...m.user, role: m.role })),
    habits,
    streaks: streaks.sort((a, b) => b.streak - a.streak),
    weeklyData,
    consistency: consistency.sort((a, b) => b.pct - a.pct),
    heatmap,
    memberNames: members.map((m) => m.user.name ?? m.userId),
  })
}
