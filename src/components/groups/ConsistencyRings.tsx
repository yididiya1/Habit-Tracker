"use client"

import Image from "next/image"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"]

interface Entry {
  userId: string
  name: string | null
  image: string | null
  pct: number
}

export default function ConsistencyRings({ consistency }: { consistency: Entry[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">Consistency Rate</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {consistency.map((entry, i) => {
          const data = [{ value: entry.pct }, { value: 100 - entry.pct }]
          return (
            <div key={entry.userId} className="flex flex-col items-center gap-1 rounded-xl bg-zinc-800/40 py-3">
              <div className="relative h-14 w-14">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} innerRadius={20} outerRadius={27} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                      <Cell fill={COLORS[i % COLORS.length]} />
                      <Cell fill="#27272a" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  {entry.image ? (
                    <Image src={entry.image} alt={entry.name ?? ""} width={20} height={20} className="rounded-full" />
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-300">{entry.name?.[0] ?? "?"}</span>
                  )}
                </div>
              </div>
              <p className="text-xs font-semibold" style={{ color: COLORS[i % COLORS.length] }}>{entry.pct}%</p>
              <p className="max-w-full truncate px-2 text-center text-[10px] text-zinc-500">{entry.name?.split(" ")[0]}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
