import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/groups/join — { joinCode: "ABC12345" }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { joinCode } = await req.json()
  if (!joinCode) return NextResponse.json({ error: "Join code required" }, { status: 400 })

  const group = await prisma.group.findUnique({ where: { joinCode: joinCode.toUpperCase() } })
  if (!group) return NextResponse.json({ error: "Invalid join code" }, { status: 404 })

  // Already a member?
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: session.user.id } },
  })
  if (existing) return NextResponse.json({ groupId: group.id, alreadyMember: true })

  await prisma.groupMember.create({
    data: { groupId: group.id, userId: session.user.id, role: "MEMBER" },
  })

  return NextResponse.json({ groupId: group.id }, { status: 201 })
}
