import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/habits/[id] — update a habit
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, category, type, color, icon, targetCount, scheduleDays } = body

  const existing = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 })
  }

  const habit = await prisma.habit.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(category && { category }),
      ...(type && { type }),
      ...(color && { color }),
      ...(icon !== undefined && { icon }),
      ...(targetCount !== undefined && { targetCount }),
      ...(scheduleDays !== undefined && { scheduleDays }),
    },
  })

  return NextResponse.json(habit)
}

// DELETE /api/habits/[id] — archive a habit (soft delete)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.habit.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 })
  }

  await prisma.habit.update({
    where: { id },
    data: { archived: true },
  })

  return NextResponse.json({ success: true })
}
