"use client"

import Image from "next/image"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Member { user: { id: string; name: string | null; image: string | null } }
interface Log { userId: string; completed: boolean }
interface Habit { id: string; name: string; type: string; color: string }

interface Props {
  habit: Habit
  members: Member[]
  myLogs: Log[]
  myUserId: string
  onToggle: (habitId: string) => Promise<void>
  toggling: string | null
}

export default function TodayGroupCheckin({ habit, members, myLogs, myUserId, onToggle, toggling }: Props) {
  const myLog = myLogs.find((l) => l.userId === myUserId)
  const doneCount = myLogs.filter((l) => l.completed).length

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
          <span className="font-semibold text-zinc-100">{habit.name}</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">{habit.type}</span>
        </div>
        <span className="text-sm text-zinc-500">{doneCount}/{members.length} done today</span>
      </div>

      {/* My check-in button */}
      <Button
        onClick={() => onToggle(habit.id)}
        disabled={toggling === habit.id}
        variant={myLog?.completed ? "default" : "outline"}
        className={cn("mb-4 w-full", myLog?.completed && "bg-emerald-600 hover:bg-emerald-700 border-transparent")}
      >
        {toggling === habit.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : myLog?.completed ? (
          <><Check className="mr-2 h-4 w-4" /> Completed!</>
        ) : (
          "Mark as done"
        )}
      </Button>

      {/* Members grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {members.map(({ user }) => {
          const log = myLogs.find((l) => l.userId === user.id)
          return (
            <div key={user.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                log?.completed
                  ? "border-emerald-700/40 bg-emerald-900/20 text-emerald-300"
                  : "border-zinc-700/40 bg-zinc-800/30 text-zinc-400"
              )}>
              {user.image ? (
                <Image src={user.image} alt={user.name ?? ""} width={20} height={20} className="rounded-full" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold text-zinc-300">
                  {user.name?.[0] ?? "?"}
                </div>
              )}
              <span className="truncate">{user.name?.split(" ")[0] ?? "User"}</span>
              {log?.completed && <Check className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
