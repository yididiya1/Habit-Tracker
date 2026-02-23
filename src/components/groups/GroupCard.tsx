"use client"

import Link from "next/link"
import Image from "next/image"
import { Users, Crown, CalendarDays } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

interface GroupCardProps {
  group: {
    id: string
    name: string
    description: string | null
    emoji: string
    color: string
    endDate: string | null
    myRole: string
    habits: { id: string; name: string; type: string }[]
    members: { user: { id: string; name: string | null; image: string | null } }[]
  }
}

export default function GroupCard({ group }: GroupCardProps) {
  const progressPct = group.endDate
    ? Math.min(100, Math.round(
        ((Date.now() - new Date(group.endDate).getTime() + 30 * 86400000) /
          (30 * 86400000)) * 100
      ))
    : null

  return (
    <Link href={`/dashboard/groups/${group.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-black/30 backdrop-blur-sm">
      {/* Color top bar */}
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ backgroundColor: group.color }} />

      <div className="mt-1 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{group.emoji}</span>
          <div>
            <h3 className="font-semibold text-zinc-100 group-hover:text-white">{group.name}</h3>
            {group.description && <p className="text-xs text-zinc-500 line-clamp-1">{group.description}</p>}
          </div>
        </div>
        {group.myRole === "OWNER" && (
          <span title="Owner"><Crown className="h-3.5 w-3.5 text-amber-400" /></span>
        )}
      </div>

      {/* Habit name */}
      {group.habits[0] && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} />
          <span className="text-xs text-zinc-400">{group.habits[0].name}</span>
          <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">{group.habits[0].type}</span>
        </div>
      )}

      {/* Challenge progress */}
      {group.endDate && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Challenge</span>
            <span>ends {format(new Date(group.endDate), "MMM d")}</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800">
            <div className="h-1 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: group.color }} />
          </div>
        </div>
      )}

      {/* Members */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {group.members.slice(0, 5).map(({ user }) => (
            user.image ? (
              <Image key={user.id} src={user.image} alt={user.name ?? ""} width={24} height={24}
                className="h-6 w-6 rounded-full ring-2 ring-zinc-900" />
            ) : (
              <div key={user.id} className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-zinc-900 bg-zinc-700 text-zinc-300")}>
                {user.name?.[0] ?? "?"}
              </div>
            )
          ))}
          {group.members.length > 5 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-[10px] text-zinc-300 ring-2 ring-zinc-900">
              +{group.members.length - 5}
            </div>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <Users className="h-3 w-3" /> {group.members.length}
        </span>
      </div>
    </Link>
  )
}
