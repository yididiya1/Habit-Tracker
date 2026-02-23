"use client"

import { formatDuration } from "@/lib/utils"

interface CategoryEntry {
  category: string
  minutes: number
}

interface HabitEntry {
  name: string
  minutes: number
  color: string
  category: string
}

interface CategoryBreakdownProps {
  categoryData: CategoryEntry[]
  habitTotals: HabitEntry[]
  totalMinutes: number
}

export default function CategoryBreakdown({
  categoryData,
  habitTotals,
  totalMinutes,
}: CategoryBreakdownProps) {
  if (totalMinutes === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
        No time logged in this period.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* By category */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          By Category
        </p>
        {categoryData.map((c) => {
          const pct = Math.round((c.minutes / totalMinutes) * 100)
          return (
            <div key={c.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{c.category}</span>
                <span className="text-zinc-400">
                  {formatDuration(c.minutes)}{" "}
                  <span className="text-zinc-600">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* By habit */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          By Habit
        </p>
        {habitTotals.map((h) => {
          const pct = Math.round((h.minutes / totalMinutes) * 100)
          return (
            <div key={h.name} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: h.color }}
              />
              <span className="flex-1 truncate text-zinc-300">{h.name}</span>
              <span className="text-xs text-zinc-600">{h.category}</span>
              <span className="w-16 text-right font-medium text-zinc-200">
                {formatDuration(h.minutes)}
              </span>
              <div className="w-20 overflow-hidden rounded-full bg-zinc-800 h-1.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: h.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
