import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

// POST /api/groups/[id]/habits — create a new habit in the group
export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId } = await params
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { name, type, color, targetCount } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const habit = await prisma.groupHabit.create({
    data: {
      groupId,
      name: name.trim(),
      type: type || "CHECKBOX",
      color: color || "#6366f1",
      targetCount: targetCount || null,
    },
  })

  return NextResponse.json(habit, { status: 201 })
}
