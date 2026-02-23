"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { formatDuration } from "@/lib/utils"

interface HabitTimeEntry {
  id: string
  name: string
  category: string
  type: "CHECKBOX" | "TIMER" | "COUNT"
  color: string
  duration: number
}

export default function TodayTimeBreakdown() {
  const [entries, setEntries] = useState<HabitTimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/today/time-breakdown")
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch_()
  }, [fetch_])

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-600">
        No time logged today yet.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <div
          key={e.id}
          className="flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: e.color }}
            />
            <span className="truncate text-zinc-300">{e.name}</span>
            <span className="shrink-0 text-xs text-zinc-600">{e.category}</span>
          </div>
          <span className="ml-3 shrink-0 font-medium text-amber-400">
            {formatDuration(e.duration)}
          </span>
        </div>
      ))}

      <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-sm font-semibold">
        <span className="text-zinc-400">Total</span>
        <span className="text-zinc-100">{formatDuration(totalMinutes)}</span>
      </div>
    </div>
  )
}
