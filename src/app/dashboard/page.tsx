import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { CheckSquare, Clock, Flame, TrendingUp } from "lucide-react"
import { formatDuration } from "@/lib/utils"
import { calcStreaks } from "@/lib/streaks"
import DashboardWidgetsGrid from "@/components/dashboard/DashboardWidgetsGrid"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)!
  if (!session?.user?.id) return null

  const userId = session.user.id
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [habitCount, todayLogs, totalMinutesToday, allLogs] = await Promise.all([
    prisma.habit.count({ where: { userId, archived: false } }),
    prisma.habitLog.count({
      where: { userId, date: today, completed: true },
    }),
    prisma.habitLog.aggregate({
      where: { userId, date: today },
      _sum: { duration: true },
    }),
    prisma.habitLog.findMany({
      where: { userId, OR: [{ completed: true }, { duration: { gt: 0 } }] },
      select: { date: true },
      orderBy: { date: "asc" },
    }),
  ])

  const totalMin = totalMinutesToday._sum.duration ?? 0

  const allDates = allLogs.map((l) => l.date.toISOString().slice(0, 10))
  const { current: bestCurrent } = calcStreaks(allDates)

  const stats = [
    {
      label: "Total Habits",
      value: habitCount,
      icon: CheckSquare,
      color: "text-indigo-400",
      bg: "bg-indigo-600/10",
    },
    {
      label: "Completed Today",
      value: todayLogs,
      icon: Flame,
      color: "text-emerald-400",
      bg: "bg-emerald-600/10",
    },
    {
      label: "Time Logged Today",
      value: formatDuration(totalMin),
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-600/10",
    },
    {
      label: "Streak",
      value: bestCurrent > 0 ? `${bestCurrent}d` : "—",
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-600/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Good {getGreeting()}, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-zinc-500">
          Here&apos;s your overview for today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg p-2.5 ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{s.label}</p>
                <p className="text-2xl font-bold text-zinc-100">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widgets grid: Today + Timer + Analytics */}
      <DashboardWidgetsGrid />
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}
