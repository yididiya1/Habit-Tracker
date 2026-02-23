"use client"

import { useEffect, useState } from "react"
import { Loader2, Flame, TrendingUp, CheckSquare, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDuration } from "@/lib/utils"
import { format, parseISO, getDay } from "date-fns"

interface HeatmapDay {
  date: string
  done: boolean
}

interface HabitStats {
  habit: { id: string; name: string; color: string; category: string; type: string }
  streaks: { current: number; longest: number }
  heatmap: HeatmapDay[]
  totalCompletions: number
  totalMinutes: number
}

interface HabitStatsModalProps {
  habitId: string | null
  habitName: string
  onClose: () => void
}

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function HabitHeatmap({ data, color }: { data: HeatmapDay[]; color: string }) {
  if (data.length === 0) return null

  const firstDow = getDay(parseISO(data[0].date))
  const padStart = firstDow === 0 ? 6 : firstDow - 1

  const cells: (HeatmapDay | null)[] = [...Array(padStart).fill(null), ...data]
  const weeks: (HeatmapDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  // Month labels
  const monthLabels: { label: string; wi: number }[] = []
  weeks.forEach((week, wi) => {
    const first = week.find(Boolean) as HeatmapDay | undefined
    if (first) {
      const m = format(parseISO(first.date), "MMM")
      if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== m)
        monthLabels.push({ label: m, wi })
    }
  })

  return (
    <div className="overflow-x-auto pb-1">
      {/* Month labels */}
      <div className="flex gap-px pl-8 mb-1">
        {weeks.map((_, wi) => {
          const ml = monthLabels.find((m) => m.wi === wi)
          return (
            <div key={wi} className="w-4 flex-shrink-0 text-center text-[10px] text-zinc-500">
              {ml?.label ?? ""}
            </div>
          )
        })}
      </div>

      <div className="flex gap-1">
        {/* DOW */}
        <div className="flex flex-col gap-px pr-1">
          {DOW_LABELS.map((d, i) => (
            <div key={d} className="flex h-4 w-6 items-center justify-end text-[10px] text-zinc-600">
              {i % 2 === 0 ? d : ""}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-px">
            {week.map((day, di) => (
              <div
                key={di}
                className="h-4 w-4 flex-shrink-0 rounded-sm"
                style={{
                  backgroundColor: day
                    ? day.done
                      ? color
                      : "#27272a"
                    : "transparent",
                  opacity: day?.done ? 1 : day ? 0.4 : 0,
                }}
                title={
                  day
                    ? `${format(parseISO(day.date), "MMM d, yyyy")} — ${day.done ? "Completed" : "Not done"}`
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HabitStatsModal({
  habitId,
  habitName,
  onClose,
}: HabitStatsModalProps) {
  const [stats, setStats] = useState<HabitStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!habitId) return
    setStats(null)
    setLoading(true)
    fetch(`/api/habits/${habitId}/stats`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [habitId])

  return (
    <Dialog open={!!habitId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stats && (
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: stats.habit.color }}
              />
            )}
            {habitName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        )}

        {stats && !loading && (
          <div className="space-y-5 pt-1">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Current streak",
                  value: `${stats.streaks.current}d`,
                  icon: Flame,
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                },
                {
                  label: "Longest streak",
                  value: `${stats.streaks.longest}d`,
                  icon: TrendingUp,
                  color: "text-indigo-400",
                  bg: "bg-indigo-500/10",
                },
                {
                  label: "Total completions",
                  value: stats.totalCompletions,
                  icon: CheckSquare,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                ...(stats.totalMinutes > 0
                  ? [
                      {
                        label: "Total time logged",
                        value: formatDuration(stats.totalMinutes),
                        icon: Clock,
                        color: "text-amber-400",
                        bg: "bg-amber-500/10",
                      },
                    ]
                  : []),
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
                >
                  <div className={`rounded-md p-1.5 w-fit ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <p className="text-lg font-bold text-zinc-100">{s.value}</p>
                  <p className="text-[11px] text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* 90-day heatmap */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                90-day history
              </p>
              <HabitHeatmap
                data={stats.heatmap}
                color={stats.habit.color}
              />
              <div className="mt-2 flex items-center gap-2 pl-8">
                <span className="text-[10px] text-zinc-600">Not done</span>
                <div className="h-3 w-3 rounded-sm bg-zinc-800 opacity-40" />
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: stats.habit.color }}
                />
                <span className="text-[10px] text-zinc-600">Done</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
