"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDuration } from "@/lib/utils"
import TimeBarChart from "./TimeBarChart"
import CategoryBreakdown from "./CategoryBreakdown"
import ConsistencyHeatmap from "./ConsistencyHeatmap"

type Period = "daily" | "weekly" | "monthly" | "all"

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today", value: "daily" },
  { label: "This week", value: "weekly" },
  { label: "This month", value: "monthly" },
  { label: "All time", value: "all" },
]

interface HabitMeta {
  name: string
  color: string
  category: string
}

interface TimeData {
  barData: Record<string, unknown>[]
  habitMeta: Record<string, HabitMeta>
  categoryData: { category: string; minutes: number }[]
  habitTotals: { name: string; minutes: number; color: string; category: string }[]
  totalMinutes: number
}

interface ConsistencyDay {
  date: string
  pct: number
  completed: number
  total: number
}

export default function AnalyticsView() {
  const [period, setPeriod] = useState<Period>("weekly")
  const [timeData, setTimeData] = useState<TimeData | null>(null)
  const [consistency, setConsistency] = useState<ConsistencyDay[]>([])
  const [loadingTime, setLoadingTime] = useState(true)
  const [loadingHeatmap, setLoadingHeatmap] = useState(true)

  const fetchTime = useCallback(async (p: Period) => {
    setLoadingTime(true)
    const res = await fetch(`/api/analytics/time?period=${p}`)
    if (res.ok) setTimeData(await res.json())
    setLoadingTime(false)
  }, [])

  const fetchConsistency = useCallback(async () => {
    setLoadingHeatmap(true)
    const res = await fetch("/api/analytics/consistency?days=90")
    if (res.ok) setConsistency(await res.json())
    setLoadingHeatmap(false)
  }, [])

  useEffect(() => {
    fetchTime(period)
  }, [period, fetchTime])

  useEffect(() => {
    fetchConsistency()
  }, [fetchConsistency])

  return (
    <div className="space-y-6">
      {/* Header + period filter */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Analytics</h2>
          <p className="text-sm text-zinc-500">
            Your time, habits, and consistency at a glance.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total time stat */}
      {timeData && (
        <div className="flex gap-4">
          <Card className="flex-1 sm:max-w-xs">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500">
                Total time ({PERIODS.find((p2) => p2.value === period)?.label.toLowerCase()})
              </p>
              <p className="mt-1 text-3xl font-bold text-zinc-100">
                {timeData.totalMinutes > 0
                  ? formatDuration(timeData.totalMinutes)
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hours per day + Time breakdown — two columns */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hours per day</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTime ? (
              <div className="flex h-48 items-center justify-center text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <TimeBarChart
                data={timeData?.barData ?? []}
                habitMeta={timeData?.habitMeta ?? {}}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Time breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTime ? (
              <div className="flex h-32 items-center justify-center text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <CategoryBreakdown
                categoryData={timeData?.categoryData ?? []}
                habitTotals={timeData?.habitTotals ?? []}
                totalMinutes={timeData?.totalMinutes ?? 0}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consistency heatmap — always 90 days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">90-day consistency</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHeatmap ? (
            <div className="flex h-32 items-center justify-center text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <ConsistencyHeatmap data={consistency} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
