import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

// GET /api/groups/[id]/messages?cursor=<id> — latest 50 messages (or since cursor)
export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId } = await params

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member)
    return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const url = new URL(req.url)
  const cursor = url.searchParams.get("cursor")

  // If cursor provided, fetch only messages after that message's id (by createdAt)
  let afterDate: Date | undefined
  if (cursor) {
    const pivot = await prisma.groupMessage.findUnique({ where: { id: cursor }, select: { createdAt: true } })
    afterDate = pivot?.createdAt
  }

  const messages = await prisma.groupMessage.findMany({
    where: {
      groupId,
      ...(afterDate ? { createdAt: { gt: afterDate } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: cursor ? 100 : 50,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json(messages)
}

// POST /api/groups/[id]/messages — send a message
export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: groupId } = await params

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  })
  if (!member)
    return NextResponse.json({ error: "Not a member" }, { status: 403 })

  const { text } = await req.json()
  if (!text?.trim())
    return NextResponse.json({ error: "Empty message" }, { status: 400 })

  const message = await prisma.groupMessage.create({
    data: { groupId, userId: session.user.id, text: text.trim() },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  return NextResponse.json(message, { status: 201 })
}
