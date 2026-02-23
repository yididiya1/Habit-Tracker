import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay } from "date-fns"

type Params = { params: Promise<{ id: string }> }

// GET /api/groups/[id]/today — all members' logs for today
export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId } = await params
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const today = startOfDay(new Date())

  const habits = await prisma.groupHabit.findMany({
    where: { groupId },
    include: {
      logs: {
        where: { date: today },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  })

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  return NextResponse.json({ habits, members })
}

// PATCH /api/groups/[id]/today — log my completion
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId } = await params
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const { habitId, completed, duration, count } = await req.json()
  const today = startOfDay(new Date())

  const existing = await prisma.groupHabitLog.findUnique({
    where: { habitId_userId_date: { habitId, userId: session.user.id, date: today } },
  })

  const log = existing
    ? await prisma.groupHabitLog.update({
        where: { id: existing.id },
        data: {
          completed: completed ?? existing.completed,
          duration: duration !== undefined ? (existing.duration ?? 0) + duration : existing.duration,
          count: count !== undefined ? Math.max(0, (existing.count ?? 0) + count) : existing.count,
        },
      })
    : await prisma.groupHabitLog.create({
        data: {
          habitId,
          userId: session.user.id,
          date: today,
          completed: completed ?? false,
          duration: duration ?? null,
          count: count ?? null,
        },
      })

  return NextResponse.json(log)
}
