import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{ joinCode: string }>
}

export default async function JoinPage({ params }: Props) {
  const { joinCode } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/join/${joinCode}`)
  }

  const group = await prisma.group.findUnique({ where: { joinCode: joinCode.toUpperCase() } })
  if (!group) redirect("/dashboard/groups?error=invalid_code")

  // Already a member?
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: session.user.id } },
  })

  if (!existing) {
    await prisma.groupMember.create({
      data: { groupId: group.id, userId: session.user.id, role: "MEMBER" },
    })
  }

  redirect(`/dashboard/groups/${group.id}`)
}
