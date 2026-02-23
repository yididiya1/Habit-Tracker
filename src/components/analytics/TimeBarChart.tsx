"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { formatDuration } from "@/lib/utils"

interface HabitMeta {
  name: string
  color: string
  category: string
}

interface TimeBarChartProps {
  data: Record<string, unknown>[]
  habitMeta: Record<string, HabitMeta>
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; fill: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-zinc-200">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.fill }}
            />
            {p.name}
          </span>
          <span className="font-medium text-zinc-200">{formatDuration(p.value)}</span>
        </div>
      ))}
      {payload.length > 1 && (
        <div className="mt-2 flex justify-between border-t border-zinc-700 pt-2 font-semibold text-zinc-200">
          <span>Total</span>
          <span>{formatDuration(total)}</span>
        </div>
      )}
    </div>
  )
}

export default function TimeBarChart({ data, habitMeta }: TimeBarChartProps) {
  const habitNames = Object.keys(habitMeta)

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
        No time logged in this period.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v >= 60 ? `${Math.floor(v / 60)}h` : `${v}m`)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        {habitNames.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#71717a", paddingTop: 12 }}
          />
        )}
        {habitNames.map((name) => (
          <Bar
            key={name}
            dataKey={name}
            stackId="a"
            fill={habitMeta[name]?.color ?? "#6366f1"}
            radius={habitNames.indexOf(name) === habitNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
