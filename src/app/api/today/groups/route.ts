import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTodayDate } from "@/lib/utils"

export interface GroupTodayItem {
  groupHabitId: string
  groupId: string
  groupName: string
  groupColor: string
  groupEmoji: string
  name: string
  type: "CHECKBOX" | "TIMER" | "COUNT"
  targetCount: number | null
  log: {
    completed: boolean
    duration: number | null
    count: number | null
  } | null
}

// GET /api/today/groups — group habits for the current user today
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = getTodayDate()

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          habits: {
            include: {
              logs: {
                where: { userId: session.user.id, date: today },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  const items: GroupTodayItem[] = memberships.flatMap((m) =>
    m.group.habits.map((h) => ({
      groupHabitId: h.id,
      groupId: m.group.id,
      groupName: m.group.name,
      groupColor: m.group.color,
      groupEmoji: m.group.emoji,
      name: h.name,
      type: h.type as "CHECKBOX" | "TIMER" | "COUNT",
      targetCount: h.targetCount,
      log: h.logs[0]
        ? {
            completed: h.logs[0].completed,
            duration: h.logs[0].duration,
            count: h.logs[0].count,
          }
        : null,
    }))
  )

  return NextResponse.json(items)
}
