import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/habits — list all habits for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, archived: false },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(habits)
}

// POST /api/habits — create a new habit
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, category, type, color, icon, targetCount, scheduleDays } = body

  if (!name || !category) {
    return NextResponse.json(
      { error: "Name and category are required" },
      { status: 400 }
    )
  }

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name,
      category,
      type: type ?? "CHECKBOX",
      color: color ?? "#6366f1",
      icon: icon ?? null,
      targetCount: targetCount ?? null,
      scheduleDays: scheduleDays ?? [],
    },
  })

  return NextResponse.json(habit, { status: 201 })
}
