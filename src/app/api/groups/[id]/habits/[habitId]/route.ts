import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string; habitId: string }> }

// PATCH /api/groups/[id]/habits/[habitId]
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId, habitId } = await params
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { name, type, color, targetCount } = await req.json()
  const habit = await prisma.groupHabit.update({
    where: { id: habitId },
    data: {
      ...(name && { name: name.trim() }),
      ...(type && { type }),
      ...(color && { color }),
      ...(targetCount !== undefined && { targetCount: targetCount || null }),
    },
  })

  return NextResponse.json(habit)
}

// DELETE /api/groups/[id]/habits/[habitId]
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId, habitId } = await params
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member || !["OWNER", "ADMIN"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.groupHabit.delete({ where: { id: habitId } })
  return NextResponse.json({ success: true })
}
