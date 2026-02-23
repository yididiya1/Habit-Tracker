"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"]

interface Props {
  weeklyData: Record<string, string | number>[]
  memberNames: string[]
}

export default function WeeklyComparisonChart({ weeklyData, memberNames }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">Weekly Completions</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }}
            tickFormatter={(v: string) => new Date(v + "T00:00:00").toLocaleDateString("en", { weekday: "short" })} />
          <YAxis tick={{ fill: "#71717a", fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
            labelStyle={{ color: "#a1a1aa" }}
            itemStyle={{ color: "#e4e4e7" }}
            cursor={{ fill: "rgba(63, 63, 70, 0.4)" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#71717a" }} />
          {memberNames.map((name, i) => (
            <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={20} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
