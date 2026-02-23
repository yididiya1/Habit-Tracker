"use client"

import { useEffect, useState, useCallback } from "react"
import { format } from "date-fns"
import { Loader2, CalendarDays } from "lucide-react"
import { formatDuration } from "@/lib/utils"
import TodayHabitRow from "./TodayHabitRow"

interface HabitLog {
  id: string
  completed: boolean
  duration: number | null
  count: number | null
  note: string | null
}

interface HabitWithLog {
  id: string
  name: string
  category: string
  type: "CHECKBOX" | "TIMER" | "COUNT"
  color: string
  targetCount: number | null
  log: HabitLog | null
}

export default function TodayView() {
  const [habits, setHabits] = useState<HabitWithLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchToday = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/today")
    if (res.ok) setHabits(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchToday()
  }, [fetchToday])

  function handleUpdate(habitId: string, log: Partial<HabitLog>) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, log: { ...(h.log ?? { id: "", note: null }), ...log } as HabitLog }
          : h
      )
    )
  }

  // Derived stats
  const checkboxHabits = habits.filter((h) => h.type === "CHECKBOX")
  const timerHabits = habits.filter((h) => h.type === "TIMER")
  const countHabits = habits.filter((h) => h.type === "COUNT")

  const completedCheckboxes = checkboxHabits.filter(
    (h) => h.log?.completed
  ).length
  const completedTimers = timerHabits.filter((h) => h.log?.duration).length
  const completedCounts = countHabits.filter(
    (h) => (h.log?.count ?? 0) >= (h.targetCount ?? 1)
  ).length

  const totalMinutes = habits.reduce(
    (sum, h) => sum + (h.log?.duration ?? 0),
    0
  )

  const completionPct =
    habits.length > 0
      ? Math.round(
          ((completedCheckboxes + completedTimers + completedCounts) /
            habits.length) *
            100
        )
      : 0

  const groupedByCategory = habits.reduce<Record<string, HabitWithLog[]>>(
    (acc, h) => {
      if (!acc[h.category]) acc[h.category] = []
      acc[h.category].push(h)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">
            {format(new Date(), "EEEE, MMMM d")}
          </h2>
          <p className="text-sm text-zinc-500">
            {habits.length === 0
              ? "No habits yet — create some in the Habits tab"
              : `${completedCheckboxes + completedTimers + completedCounts} of ${habits.length} completed`}
          </p>
        </div>

        {totalMinutes > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-zinc-100">
              {formatDuration(totalMinutes)}
            </p>
            <p className="text-xs text-zinc-500">total today</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {habits.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Daily progress</span>
            <span>{completionPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Habit list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20 text-center">
          <CalendarDays className="mb-3 h-10 w-10 text-zinc-600" />
          <p className="font-medium text-zinc-400">No habits yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Go to Habits to create your first habit.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} className="space-y-2">
              {/* Category label */}
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {category}
                </p>
                <div className="flex-1 border-t border-zinc-800" />
                <span className="text-xs text-zinc-600">
                  {items.filter((h) =>
                    h.type === "CHECKBOX"
                      ? h.log?.completed
                      : h.log?.duration
                  ).length}
                  /{items.length}
                </span>
              </div>

              {/* Habit rows */}
              {items.map((habit) => (
                <TodayHabitRow
                  key={habit.id}
                  habit={habit}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          ))}
        </div>
      )}


    </div>
  )
}
