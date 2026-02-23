"use client"

import { useState } from "react"
import { CheckSquare, Square, Clock, Loader2, Check, Hash, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatDuration } from "@/lib/utils"

interface HabitLog {
  id: string
  completed: boolean
  duration: number | null
  count: number | null
  note: string | null
}

interface Habit {
  id: string
  name: string
  category: string
  type: "CHECKBOX" | "TIMER" | "COUNT"
  color: string
  targetCount: number | null
  log: HabitLog | null
}

interface TodayHabitRowProps {
  habit: Habit
  onUpdate: (habitId: string, log: Partial<HabitLog>) => void
}

export default function TodayHabitRow({ habit, onUpdate }: TodayHabitRowProps) {
  const [saving, setSaving] = useState(false)
  const [durationInput, setDurationInput] = useState("")
  const [showDurationInput, setShowDurationInput] = useState(false)
  const [saved, setSaved] = useState(false)
  const [countInput, setCountInput] = useState("")
  const [showCountInput, setShowCountInput] = useState(false)

  const isCompleted = habit.log?.completed ?? false
  const loggedDuration = habit.log?.duration ?? null
  const loggedCount = habit.log?.count ?? 0
  const targetCount = habit.targetCount ?? 1
  const isCountComplete = habit.type === "COUNT" && loggedCount >= targetCount

  async function patch(data: Record<string, unknown>) {
    setSaving(true)
    try {
      const res = await fetch(`/api/today/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const log = await res.json()
        onUpdate(habit.id, log)
      }
    } finally {
      setSaving(false)
    }
  }

  async function toggleCheckbox() {
    await patch({ completed: !isCompleted })
  }

  async function logDuration() {
    const minutes = parseInt(durationInput, 10)
    if (isNaN(minutes) || minutes <= 0) return
    await patch({ completed: true, duration: minutes })
    setDurationInput("")
    setShowDurationInput(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function incrementCount(amount: number) {
    // Don't decrement below 0
    if (amount < 0 && loggedCount + amount < 0) return
    await patch({ count: amount })
  }

  async function logCustomCount() {
    const amount = parseInt(countInput, 10)
    if (isNaN(amount) || amount <= 0) return
    await patch({ count: amount })
    setCountInput("")
    setShowCountInput(false)
  }

  if (habit.type === "CHECKBOX") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors",
          isCompleted
            ? "border-zinc-700 bg-zinc-900/50"
            : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
        )}
      >
        {/* Color bar */}
        <div
          className="h-9 w-1 flex-shrink-0 rounded-full"
          style={{ backgroundColor: habit.color }}
        />

        {/* Checkbox button */}
        <button
          onClick={toggleCheckbox}
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

        {/* Name + category */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "truncate font-medium transition-colors",
              isCompleted ? "text-zinc-500 line-through" : "text-zinc-100"
            )}
          >
            {habit.name}
          </p>
          <p className="text-xs text-zinc-600">{habit.category}</p>
        </div>

        {/* Done badge */}
        {isCompleted && (
          <span className="text-xs font-medium text-emerald-500">Done</span>
        )}
      </div>
    )
  }

  // ---------- COUNT ----------
  if (habit.type === "COUNT") {
    return (
      <div
        className={cn(
          "rounded-xl border px-4 py-3.5 transition-colors",
          isCountComplete
            ? "border-zinc-700 bg-zinc-900/50"
            : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Color bar */}
          <div
            className="h-9 w-1 flex-shrink-0 rounded-full"
            style={{ backgroundColor: habit.color }}
          />

          {/* Icon */}
          <Hash
            className={cn(
              "h-5 w-5 flex-shrink-0",
              isCountComplete ? "text-emerald-400" : "text-zinc-500"
            )}
          />

          {/* Name + category */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "truncate font-medium",
              isCountComplete ? "text-zinc-500" : "text-zinc-100"
            )}>
              {habit.name}
            </p>
            <p className="text-xs text-zinc-600">{habit.category}</p>
          </div>

          {/* Count progress + controls — always visible */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium tabular-nums",
              isCountComplete ? "text-emerald-400" : "text-zinc-300"
            )}>
              {isCountComplete && <Check className="inline h-3.5 w-3.5 mr-1" />}
              {loggedCount} / {targetCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => incrementCount(-1)}
              disabled={saving || loggedCount <= 0}
              className="px-2"
              title="Decrease by 1"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => incrementCount(1)}
              disabled={saving}
              className="gap-1 px-2"
              title="Increase by 1"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCountInput((v) => !v)}
            >
              More
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 ml-10 h-1 w-full max-w-xs overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${Math.min(100, (loggedCount / targetCount) * 100)}%` }}
          />
        </div>

        {/* Custom count input — always accessible */}
        {showCountInput && (
          <div className="mt-3 flex items-center gap-2 pl-10">
            <div className="relative">
              <Input
                type="number"
                placeholder="Amount"
                value={countInput}
                onChange={(e) => setCountInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && logCustomCount()}
                className="w-28 text-sm"
                autoFocus
              />
            </div>
            <Button size="sm" onClick={logCustomCount} disabled={saving || !countInput}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCountInput(false)
                setCountInput("")
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    )
  }

  // ---------- TIMER ----------
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3.5 transition-colors",
        loggedDuration
          ? "border-zinc-700 bg-zinc-900/50"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Color bar */}
        <div
          className="h-9 w-1 flex-shrink-0 rounded-full"
          style={{ backgroundColor: habit.color }}
        />

        {/* Icon */}
        <Clock
          className={cn(
            "h-5 w-5 flex-shrink-0",
            loggedDuration ? "text-amber-400" : "text-zinc-500"
          )}
        />

        {/* Name + category */}
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-zinc-100">{habit.name}</p>
          <p className="text-xs text-zinc-600">{habit.category}</p>
        </div>

        {/* Logged duration or log button */}
        {loggedDuration ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-amber-400">
              {formatDuration(loggedDuration)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDurationInput(true)}
            >
              Edit
            </Button>
          </div>
        ) : saved ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Logged
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDurationInput((v) => !v)}
          >
            <Clock className="h-3.5 w-3.5" />
            Log time
          </Button>
        )}
      </div>

      {/* Duration input — expands inline */}
      {showDurationInput && (
        <div className="mt-3 flex items-center gap-2 pl-10">
          <div className="relative">
            <Input
              type="number"
              min={1}
              placeholder="Minutes"
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && logDuration()}
              className="w-32 pr-10 text-sm"
              autoFocus
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              min
            </span>
          </div>
          <Button size="sm" onClick={logDuration} disabled={saving || !durationInput}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowDurationInput(false)
              setDurationInput("")
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
