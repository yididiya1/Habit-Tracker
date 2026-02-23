import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

async function getMembership(groupId: string, userId: string) {
  return prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } })
}

// GET /api/groups/[id]
export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const membership = await getMembership(id, session.user.id)
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      habits: true,
      members: {
        include: { user: { select: { id: true, name: true, image: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  })

  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ...group, myRole: membership.role })
}

// PATCH /api/groups/[id]
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const membership = await getMembership(id, session.user.id)
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, emoji, color, endDate } = body

  const group = await prisma.group.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(emoji && { emoji }),
      ...(color && { color }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
  })

  return NextResponse.json(group)
}

// DELETE /api/groups/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const membership = await getMembership(id, session.user.id)
  if (!membership || membership.role !== "OWNER") {
    return NextResponse.json({ error: "Only the owner can delete this group" }, { status: 403 })
  }

  await prisma.group.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
