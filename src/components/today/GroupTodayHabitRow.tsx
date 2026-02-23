"use client"

import { useState } from "react"
import { CheckSquare, Square, Clock, Loader2, Hash, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatDuration } from "@/lib/utils"
import type { GroupTodayItem } from "@/app/api/today/groups/route"

interface GroupTodayHabitRowProps {
  item: GroupTodayItem
  onUpdate: (groupHabitId: string, log: GroupTodayItem["log"]) => void
}

export default function GroupTodayHabitRow({ item, onUpdate }: GroupTodayHabitRowProps) {
  const [saving, setSaving] = useState(false)
  const [durationInput, setDurationInput] = useState("")
  const [showDurationInput, setShowDurationInput] = useState(false)

  const isCompleted = item.log?.completed ?? false
  const loggedDuration = item.log?.duration ?? null
  const loggedCount = item.log?.count ?? 0
  const targetCount = item.targetCount ?? 1
  const isCountComplete = item.type === "COUNT" && loggedCount >= targetCount

  async function patch(data: { habitId: string; completed?: boolean; duration?: number; count?: number }) {
    setSaving(true)
    try {
      const res = await fetch(`/api/groups/${item.groupId}/today`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const log = await res.json()
        onUpdate(item.groupHabitId, {
          completed: log.completed,
          duration: log.duration,
          count: log.count,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Group badge ──────────────────────────────────────────────
  const GroupBadge = () => (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: item.groupColor + "22", color: item.groupColor }}
    >
      <span>{item.groupEmoji}</span>
      <span>{item.groupName}</span>
    </span>
  )

  // ── CHECKBOX ──────────────────────────────────────────────────
  if (item.type === "CHECKBOX") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors",
          isCompleted
            ? "border-zinc-700 bg-zinc-900/50"
            : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
        )}
      >
        <div className="h-9 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: item.groupColor }} />

        <button
          onClick={() =>
            patch({ habitId: item.groupHabitId, completed: !isCompleted })
          }
          disabled={saving}
          className="flex-shrink-0 transition-transform active:scale-90"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          ) : isCompleted ? (
            <CheckSquare className="h-5 w-5 text-emerald-400" />
          ) : (
            <Square className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium", isCompleted ? "text-zinc-500 line-through" : "text-zinc-200")}>
            {item.name}
          </p>
          <GroupBadge />
        </div>
      </div>
    )
  }

  // ── TIMER ─────────────────────────────────────────────────────
  if (item.type === "TIMER") {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-9 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: item.groupColor }} />
          <Clock className="h-5 w-5 flex-shrink-0 text-zinc-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-200">{item.name}</p>
            <GroupBadge />
          </div>
          {loggedDuration ? (
            <span className="text-sm font-medium text-indigo-400">{formatDuration(loggedDuration)}</span>
          ) : null}
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
          <div className="flex items-center gap-2 pl-10">
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
                    patch({ habitId: item.groupHabitId, completed: true, duration: m })
                    setDurationInput("")
                    setShowDurationInput(false)
                  }
                }
              }}
              className="h-8 w-28 bg-zinc-800 text-sm"
            />
            <Button
              size="sm"
              className="h-8"
              disabled={saving || !durationInput}
              onClick={() => {
                const m = parseInt(durationInput, 10)
                if (!isNaN(m) && m > 0) {
                  patch({ habitId: item.groupHabitId, completed: true, duration: m })
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
    )
  }

  // ── COUNT ─────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors",
        isCountComplete ? "border-zinc-700 bg-zinc-900/50" : "border-zinc-800 bg-zinc-900"
      )}
    >
      <div className="h-9 w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: item.groupColor }} />
      <Hash className={cn("h-5 w-5 flex-shrink-0", isCountComplete ? "text-emerald-400" : "text-zinc-500")} />

      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium", isCountComplete ? "text-zinc-500" : "text-zinc-200")}>
          {item.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <GroupBadge />
          <span className="text-xs text-zinc-500">
            {loggedCount} / {targetCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={saving || loggedCount <= 0}
          onClick={() => {
            const newCount = loggedCount - 1
            patch({ habitId: item.groupHabitId, count: -1, completed: newCount >= targetCount })
          }}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-8 text-center text-sm font-medium text-zinc-200">{loggedCount}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={saving}
          onClick={() => {
            const newCount = loggedCount + 1
            patch({ habitId: item.groupHabitId, count: 1, completed: newCount >= targetCount })
          }}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  )
}
