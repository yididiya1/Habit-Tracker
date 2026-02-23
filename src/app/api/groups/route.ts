import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

// GET /api/groups — list groups I'm a member of or own
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          habits: true,
          members: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  })

  return NextResponse.json(memberships.map((m) => ({ ...m.group, myRole: m.role })))
}

// POST /api/groups — create a new group
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, description, emoji, color, endDate, habit } = body

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })
  if (!habit?.name?.trim()) return NextResponse.json({ error: "Habit name is required" }, { status: 400 })

  const joinCode = nanoid(8).toUpperCase()

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      emoji: emoji || "🎯",
      color: color || "#6366f1",
      joinCode,
      endDate: endDate ? new Date(endDate) : null,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
      habits: {
        create: {
          name: habit.name.trim(),
          type: habit.type || "CHECKBOX",
          color: habit.color || color || "#6366f1",
          targetCount: habit.targetCount || null,
        },
      },
    },
    include: {
      habits: true,
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  })

  return NextResponse.json(group, { status: 201 })
}
