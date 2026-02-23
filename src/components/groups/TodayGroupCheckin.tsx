"use client"

import { useState } from "react"
import Image from "next/image"
import {
  CheckSquare, Square, Clock, Hash, Plus, Minus, Check, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatDuration } from "@/lib/utils"

interface Member { user: { id: string; name: string | null; image: string | null } }
interface Log {
  userId: string
  completed: boolean
  duration: number | null
  count: number | null
}
interface Habit {
  id: string
  name: string
  type: string
  color: string
  targetCount: number | null
}

interface Props {
  groupId: string
  habit: Habit
  members: Member[]
  myLogs: Log[]
  myUserId: string
  onRefresh: () => void
}

export default function TodayGroupCheckin({
  groupId, habit, members, myLogs, myUserId, onRefresh,
}: Props) {
  const initialMyLog = myLogs.find((l) => l.userId === myUserId) ?? null
  const [myLog, setMyLog] = useState<Log | null>(initialMyLog)
  const [saving, setSaving] = useState(false)
  const [durationInput, setDurationInput] = useState("")
  const [showDurationInput, setShowDurationInput] = useState(false)

  // Keep member list logs in sync with prop (other members' updates come via refresh)
  const memberLogs = myLogs.map((l) => l.userId === myUserId && myLog ? myLog : l)

  const isCompleted = myLog?.completed ?? false
  const loggedDuration = myLog?.duration ?? null
  const loggedCount = myLog?.count ?? 0
  const targetCount = habit.targetCount ?? 1
  const isCountComplete = habit.type === "COUNT" && loggedCount >= targetCount

  const doneCount = memberLogs.filter((l) => l.completed).length

  async function patch(data: Record<string, unknown>) {
    setSaving(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/today`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: habit.id, ...data }),
      })
      if (res.ok) {
        const log = await res.json()
        setMyLog({ userId: myUserId, completed: log.completed, duration: log.duration, count: log.count })
        onRefresh()
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Member grid ───────────────────────────────────────────────
  const MemberGrid = () => (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {members.map(({ user }) => {
        const log = user.id === myUserId ? myLog : myLogs.find((l) => l.userId === user.id)
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
  )

  // ── Header ────────────────────────────────────────────────────
  const Header = () => (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
        <span className="font-semibold text-zinc-100">{habit.name}</span>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">{habit.type}</span>
      </div>
      <span className="text-sm text-zinc-500">{doneCount}/{members.length} done today</span>
    </div>
  )

  // ── CHECKBOX ──────────────────────────────────────────────────
  if (habit.type === "CHECKBOX") {
    return (
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
        <Header />
        <button
          onClick={() => patch({ completed: !isCompleted })}
          disabled={saving}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
            isCompleted
              ? "border-emerald-700/40 bg-emerald-900/20"
              : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
          )}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          ) : isCompleted ? (
            <CheckSquare className="h-5 w-5 text-emerald-400" />
          ) : (
            <Square className="h-5 w-5 text-zinc-400" />
          )}
          <span className={cn("font-medium", isCompleted ? "text-emerald-300" : "text-zinc-300")}>
            {isCompleted ? "Completed!" : "Mark as done"}
          </span>
        </button>
        <MemberGrid />
      </div>
    )
  }

  // ── TIMER ─────────────────────────────────────────────────────
  if (habit.type === "TIMER") {
    return (
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
        <Header />
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3">
            <Clock className={cn("h-5 w-5 flex-shrink-0", loggedDuration ? "text-indigo-400" : "text-zinc-500")} />
            <span className="flex-1 font-medium text-zinc-300">
              {loggedDuration ? formatDuration(loggedDuration) : "No time logged yet"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200"
              onClick={() => setShowDurationInput((p) => !p)}
            >
              {showDurationInput ? "Cancel" : loggedDuration ? "Add more" : "Log time"}
            </Button>
          </div>

          {showDurationInput && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                placeholder="minutes"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const m = parseInt(durationInput, 10)
                    if (!isNaN(m) && m > 0) {
                      patch({ completed: true, duration: m })
                      setDurationInput("")
                      setShowDurationInput(false)
                    }
                  }
                }}
                className="h-9 flex-1 bg-zinc-800 text-sm"
              />
              <Button
                size="sm"
                className="h-9"
                disabled={saving || !durationInput}
                onClick={() => {
                  const m = parseInt(durationInput, 10)
                  if (!isNaN(m) && m > 0) {
                    patch({ completed: true, duration: m })
                    setDurationInput("")
                    setShowDurationInput(false)
                  }
                }}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          )}
        </div>
        <MemberGrid />
      </div>
    )
  }

  // ── COUNT ─────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
      <Header />
      <div className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
        isCountComplete ? "border-emerald-700/40 bg-emerald-900/20" : "border-zinc-700 bg-zinc-800/50"
      )}>
        <Hash className={cn("h-5 w-5 flex-shrink-0", isCountComplete ? "text-emerald-400" : "text-zinc-500")} />
        <span className={cn("flex-1 font-medium", isCountComplete ? "text-emerald-300" : "text-zinc-300")}>
          {loggedCount} / {targetCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            disabled={saving || loggedCount <= 0}
            onClick={() => patch({ count: -1 })}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            disabled={saving}
            onClick={() => patch({ count: 1 })}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <MemberGrid />
    </div>
  )
}
