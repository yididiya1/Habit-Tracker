"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TodayView from "@/components/today/TodayView"
import TodayTimeBreakdown from "@/components/today/TodayTimeBreakdown"
import TimerWidget from "@/components/timer/TimerWidget"
import AnalyticsView from "@/components/analytics/AnalyticsView"
import { CalendarCheck, Timer, BarChart2, Clock } from "lucide-react"

export default function DashboardWidgetsGrid() {
  return (
    <div className="space-y-4">
      {/* Top row: Today's Tasks (3/7) | Time Breakdown (2/7) | Timer (2/7) */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Daily Tasks — 3 cols */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="flex-row items-center gap-2 pb-3 space-y-0">
            <div className="rounded-md bg-emerald-600/10 p-1.5">
              <CalendarCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <CardTitle className="text-sm font-semibold text-zinc-200">
              Today&apos;s Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto pt-0 px-4 pb-4">
            <TodayView />
          </CardContent>
        </Card>

        {/* Time Breakdown — 2 cols */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex-row items-center gap-2 pb-3 space-y-0">
            <div className="rounded-md bg-amber-600/10 p-1.5">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <CardTitle className="text-sm font-semibold text-zinc-200">
              Time Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto pt-0 px-4 pb-4">
            <TodayTimeBreakdown />
          </CardContent>
        </Card>

        {/* Timer — 2 cols */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex-row items-center gap-2 pb-0 space-y-0">
            {/* <div className="rounded-md bg-amber-600/10 p-1.5">
              <Timer className="h-4 w-4 text-amber-400" />
            </div>
            <CardTitle className="text-sm font-semibold text-zinc-200">
              Timer
            </CardTitle> */}
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto pt-0 px-4 pb-4">
            <TimerWidget />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Analytics — full width */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 pb-3 space-y-0">
          <div className="rounded-md bg-indigo-600/10 p-1.5">
            <BarChart2 className="h-4 w-4 text-indigo-400" />
          </div>
          <CardTitle className="text-sm font-semibold text-zinc-200">
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <AnalyticsView />
        </CardContent>
      </Card>
    </div>
  )
}
