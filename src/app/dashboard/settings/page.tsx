import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export const metadata = { title: "Settings — HabitFlow" }

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Settings</h2>
        <p className="text-sm text-zinc-500">Manage your account and preferences.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-zinc-100">{session?.user?.name}</p>
            <p className="text-sm text-zinc-500">{session?.user?.email}</p>
            <p className="mt-1 text-xs text-zinc-600">Signed in with Google</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
