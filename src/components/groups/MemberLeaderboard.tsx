"use client"

import Image from "next/image"
import { Trophy } from "lucide-react"

interface StreakEntry {
  userId: string
  name: string | null
  image: string | null
  streak: number
}

export default function MemberLeaderboard({ streaks }: { streaks: StreakEntry[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Trophy className="h-4 w-4 text-amber-400" /> Streak Leaderboard
      </h3>
      <div className="space-y-2">
        {streaks.map((s, i) => (
          <div key={s.userId} className="flex items-center gap-3 rounded-xl bg-zinc-800/40 px-3 py-2.5">
            <span className={`w-5 text-center text-sm font-bold ${i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-600"}`}>
              {i + 1}
            </span>
            {s.image ? (
              <Image src={s.image} alt={s.name ?? ""} width={28} height={28} className="rounded-full" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">
                {s.name?.[0] ?? "?"}
              </div>
            )}
            <span className="flex-1 text-sm text-zinc-200">{s.name}</span>
            <div className="flex items-center gap-1 text-sm font-semibold text-amber-400">
              🔥 {s.streak}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
