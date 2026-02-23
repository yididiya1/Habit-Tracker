"use client"

import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarDays, LogOut } from "lucide-react"

export default function Header() {
  const { data: session } = useSession()
  const today = format(new Date(), "EEEE, MMMM d")

  return (
    <header
      className="
        relative mx-3 mt-3 flex h-14 items-center justify-between
        rounded-2xl border border-zinc-800/60
        bg-zinc-900/70 px-5
        shadow-[0_4px_24px_rgba(0,0,0,0.4)]
        backdrop-blur-xl
      "
    >
      {/* Top glow line */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-zinc-600/30 to-transparent" />

      {/* Date */}
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <CalendarDays className="h-3.5 w-3.5 text-zinc-600" />
        {today}
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        {session?.user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium leading-none text-zinc-200">
                {session.user.name}
              </p>
              <p className="text-xs text-zinc-500">{session.user.email}</p>
            </div>
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-zinc-700"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-100"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
