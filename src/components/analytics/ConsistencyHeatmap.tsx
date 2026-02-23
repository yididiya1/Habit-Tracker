"use client"

import { format, parseISO, getDay } from "date-fns"

interface DayEntry {
  date: string     // yyyy-MM-dd
  pct: number      // 0-100
  completed: number
  total: number
}

interface ConsistencyHeatmapProps {
  data: DayEntry[]
}

function pctToColor(pct: number): string {
  if (pct === 0) return "bg-zinc-800"
  if (pct < 25) return "bg-indigo-900"
  if (pct < 50) return "bg-indigo-700"
  if (pct < 75) return "bg-indigo-500"
  return "bg-indigo-400"
}

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function ConsistencyHeatmap({ data }: ConsistencyHeatmapProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
        No data yet — start logging habits to see your consistency.
      </div>
    )
  }

  // Build a 7-column week grid
  // pad the front so the first day lines up on the correct DOW
  const firstDow = getDay(parseISO(data[0].date)) // 0 = Sun
  // convert Sunday=0 to Monday-first index (Mon=0 … Sun=6)
  const padStart = firstDow === 0 ? 6 : firstDow - 1

  const cells: (DayEntry | null)[] = [
    ...Array(padStart).fill(null),
    ...data,
  ]

  // Split into weeks
  const weeks: (DayEntry | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  // Gather unique months for x-axis labels
  const monthLabels: { label: string; weekIndex: number }[] = []
  weeks.forEach((week, wi) => {
    const firstReal = week.find(Boolean) as DayEntry | undefined
    if (firstReal) {
      const month = format(parseISO(firstReal.date), "MMM")
      if (
        monthLabels.length === 0 ||
        monthLabels[monthLabels.length - 1].label !== month
      ) {
        monthLabels.push({ label: month, weekIndex: wi })
      }
    }
  })

  return (
    <div className="space-y-2 overflow-x-auto pb-2">
      {/* Month labels */}
      <div className="flex gap-px pl-8">
        {weeks.map((_, wi) => {
          const ml = monthLabels.find((m) => m.weekIndex === wi)
          return (
            <div
              key={wi}
              className="w-4 flex-shrink-0 text-center text-[10px] text-zinc-500"
            >
              {ml?.label ?? ""}
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-1">
        {/* DOW labels */}
        <div className="flex flex-col gap-px pr-1">
          {DOW_LABELS.map((d, i) => (
            <div
              key={d}
              className="flex h-4 w-6 items-center justify-end text-[10px] text-zinc-600"
            >
              {i % 2 === 0 ? d : ""}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-px">
            {week.map((day, di) => (
              <div
                key={di}
                className={`h-4 w-4 flex-shrink-0 rounded-sm ${
                  day ? pctToColor(day.pct) : "bg-transparent"
                }`}
                title={
                  day
                    ? `${format(parseISO(day.date), "MMM d, yyyy")} — ${day.pct}% (${day.completed}/${day.total})`
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 pl-8 pt-1">
        <span className="text-[10px] text-zinc-600">Less</span>
        {[0, 20, 45, 65, 90].map((p) => (
          <div
            key={p}
            className={`h-3 w-3 rounded-sm ${pctToColor(p)}`}
          />
        ))}
        <span className="text-[10px] text-zinc-600">More</span>
      </div>
    </div>
  )
}
