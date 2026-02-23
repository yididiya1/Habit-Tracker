"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Copy, Check, Settings, Loader2, Users, BarChart2, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, differenceInDays } from "date-fns"
import TodayGroupCheckin from "@/components/groups/TodayGroupCheckin"
import MemberLeaderboard from "@/components/groups/MemberLeaderboard"
import WeeklyComparisonChart from "@/components/groups/WeeklyComparisonChart"
import ConsistencyRings from "@/components/groups/ConsistencyRings"
import MemberHeatmapGrid from "@/components/groups/MemberHeatmapGrid"
import GroupChatPanel from "@/components/groups/GroupChatPanel"
import GroupSettingsPanel from "@/components/groups/GroupSettingsPanel"

type Tab = "today" | "stats" | "members"

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [group, setGroup] = useState<Record<string, unknown> | null>(null)
  const [todayData, setTodayData] = useState<{ habits: unknown[]; members: unknown[] } | null>(null)
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [session, setSession] = useState<{ user: { id: string } } | null>(null)
  const [tab, setTab] = useState<Tab>("today")
  const [toggling, setToggling] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [gRes, tRes, sRes, sessRes] = await Promise.all([
      fetch(`/api/groups/${id}`),
      fetch(`/api/groups/${id}/today`),
      fetch(`/api/groups/${id}/stats?days=30`),
      fetch("/api/auth/session"),
    ])
    if (!gRes.ok) { router.push("/dashboard/groups"); return }
    const [g, t, s, sess] = await Promise.all([gRes.json(), tRes.json(), sRes.json(), sessRes.json()])
    setGroup(g)
    setTodayData(t)
    setStats(s)
    setSession(sess)
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  async function handleToggle(habitId: string) {
    setToggling(habitId)
    await fetch(`/api/groups/${id}/today`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, completed: true }),
    })
    await load()
    setToggling(null)
  }

  function copyJoinCode() {
    if (!group) return
    navigator.clipboard.writeText(`${window.location.origin}/join/${group.joinCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !group) {
    return <div className="flex items-center gap-2 text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
  }

  const g = group as {
    id: string; name: string; emoji: string; color: string; description: string | null
    joinCode: string; endDate: string | null; myRole: string
    habits: { id: string; name: string; type: string; color: string }[]
    members: { role: string; user: { id: string; name: string | null; image: string | null; email: string | null } }[]
  }
  const myUserId = session?.user?.id ?? ""
  const isAdmin = ["OWNER", "ADMIN"].includes(g.myRole)

  const daysLeft = g.endDate ? differenceInDays(new Date(g.endDate), new Date()) : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-0.5 h-8 w-8" onClick={() => router.push("/dashboard/groups")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">{g.emoji}</span>
            <h1 className="text-xl font-bold text-zinc-100">{g.name}</h1>
            <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white/80"
              style={{ backgroundColor: g.color }}>{g.myRole}</span>
          </div>
          {g.description && <p className="mt-0.5 text-sm text-zinc-500">{g.description}</p>}

          {/* Challenge countdown */}
          {g.endDate && (
            <div className="mt-2 max-w-xs">
              <div className="mb-1 flex justify-between text-[10px] text-zinc-500">
                <span>Challenge Progress</span>
                <span>{daysLeft !== null && daysLeft > 0 ? `${daysLeft}d left` : "Ended"} · {format(new Date(g.endDate), "MMM d")}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <div className="h-1.5 rounded-full" style={{
                  backgroundColor: g.color,
                  width: `${Math.min(100, Math.max(0, daysLeft !== null ? 100 - Math.round((daysLeft / 30) * 100) : 100))}%`
                }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={copyJoinCode} className="text-xs">
            {copied ? <><Check className="mr-1 h-3.5 w-3.5 text-emerald-400" /> Copied!</> : <><Copy className="mr-1 h-3.5 w-3.5" /> Invite</>}
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <GroupChatPanel groupId={g.id} groupName={g.name} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-800/50 p-1 w-fit">
        {([["today", <CalendarDays key="t" className="h-3.5 w-3.5" />, "Today"],
           ["stats", <BarChart2 key="s" className="h-3.5 w-3.5" />, "Stats"],
           ["members", <Users key="m" className="h-3.5 w-3.5" />, "Members"]] as const).map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t as Tab)}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Today tab */}
      {tab === "today" && todayData && (
        <div className="space-y-4">
          {g.habits.map((habit) => (
            <TodayGroupCheckin
              key={habit.id}
              habit={habit}
              members={todayData.members as { user: { id: string; name: string | null; image: string | null } }[]}
              myLogs={(todayData.habits as { id: string; logs: { userId: string; completed: boolean }[] }[])
                .find((h) => h.id === habit.id)?.logs ?? []}
              myUserId={myUserId}
              onToggle={handleToggle}
              toggling={toggling}
            />
          ))}
        </div>
      )}

      {/* Stats tab */}
      {tab === "stats" && stats && (
        <div className="grid gap-4 lg:grid-cols-2">
          <MemberLeaderboard streaks={(stats as { streaks: { userId: string; name: string | null; image: string | null; streak: number }[] }).streaks} />
          <ConsistencyRings consistency={(stats as { consistency: { userId: string; name: string | null; image: string | null; pct: number; completed: number }[] }).consistency} />
          <div className="lg:col-span-2">
            <WeeklyComparisonChart
              weeklyData={(stats as { weeklyData: Record<string, string | number>[] }).weeklyData}
              memberNames={(stats as { memberNames: string[] }).memberNames}
            />
          </div>
          <div className="lg:col-span-2">
            <MemberHeatmapGrid heatmap={(stats as { heatmap: { userId: string; name: string | null; image: string | null; days: { date: string; completed: boolean }[] }[] }).heatmap} />
          </div>
        </div>
      )}

      {/* Members tab */}
      {tab === "members" && (
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 p-5 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Members · {g.members.length}</h3>
          <div className="space-y-2">
            {g.members.map((m) => (
              <div key={m.user.id} className="flex items-center gap-3 rounded-xl bg-zinc-800/40 px-4 py-3">
                {m.user.image ? (
                  <Image src={m.user.image} alt={m.user.name ?? ""} width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-sm font-bold text-zinc-300">
                    {m.user.name?.[0] ?? "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{m.user.name}</p>
                  <p className="text-xs text-zinc-500">{m.user.email}</p>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  m.role === "OWNER" ? "bg-amber-900/40 text-amber-400" :
                  m.role === "ADMIN" ? "bg-indigo-900/40 text-indigo-400" :
                  "bg-zinc-700/60 text-zinc-400")}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSettings && isAdmin && (
        <GroupSettingsPanel group={g} onClose={() => setShowSettings(false)} onUpdate={load} />
      )}
    </div>
  )
}
