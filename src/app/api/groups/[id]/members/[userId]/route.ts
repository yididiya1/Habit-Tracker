import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string; userId: string }> }

// PATCH /api/groups/[id]/members/[userId] — change role
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId, userId: targetUserId } = await params
  const requester = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!requester || requester.role !== "OWNER") {
    return NextResponse.json({ error: "Only the owner can change roles" }, { status: 403 })
  }

  const { role } = await req.json()
  if (!["ADMIN", "MEMBER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const updated = await prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId: targetUserId } },
    data: { role },
  })

  return NextResponse.json(updated)
}

// DELETE /api/groups/[id]/members/[userId] — remove member
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId, userId: targetUserId } = await params

  // Allow self-leave OR owner/admin removing others
  if (session.user.id !== targetUserId) {
    const requester = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: session.user.id } },
    })
    if (!requester || !["OWNER", "ADMIN"].includes(requester.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    // Can't remove the owner
    const target = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    })
    if (target?.role === "OWNER") {
      return NextResponse.json({ error: "Cannot remove the owner" }, { status: 400 })
    }
  }

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId: targetUserId } },
  })

  return NextResponse.json({ success: true })
}
