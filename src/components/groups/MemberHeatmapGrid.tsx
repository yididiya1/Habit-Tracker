"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { subDays, format, startOfDay } from "date-fns"

interface HeatmapEntry {
  userId: string
  name: string | null
  image: string | null
  days: { date: string; completed: boolean }[]
}

const WEEKS = 10 // 10 weeks = 70 days

export default function MemberHeatmapGrid({ heatmap }: { heatmap: HeatmapEntry[] }) {
  const today = startOfDay(new Date())
  const totalDays = WEEKS * 7
  const dates = Array.from({ length: totalDays }, (_, i) =>
    format(subDays(today, totalDays - 1 - i), "yyyy-MM-dd")
  )

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">Completion Heatmap</h3>
      <div className="space-y-3 overflow-x-auto">
        {heatmap.map((entry) => {
          const logMap = new Map(entry.days.map((d) => [d.date, d.completed]))
          return (
            <div key={entry.userId} className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="flex w-20 flex-shrink-0 items-center gap-1.5">
                {entry.image ? (
                  <Image src={entry.image} alt={entry.name ?? ""} width={20} height={20} className="rounded-full flex-shrink-0" />
                ) : (
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[10px] text-zinc-300">
                    {entry.name?.[0] ?? "?"}
                  </div>
                )}
                <span className="truncate text-[11px] text-zinc-400">{entry.name?.split(" ")[0]}</span>
              </div>
              {/* Grid */}
              <div className="flex gap-0.5 flex-wrap">
                {dates.map((date) => {
                  const done = logMap.get(date)
                  return (
                    <div key={date} title={date}
                      className={cn("h-2.5 w-2.5 rounded-sm transition-colors",
                        done ? "bg-indigo-500" : "bg-zinc-800"
                      )} />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
