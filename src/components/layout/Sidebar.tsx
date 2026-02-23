"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  BarChart2,
  Settings,
  CalendarDays,
  Sparkles,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/habits", label: "Habits", icon: CheckSquare },
  { href: "/dashboard/today", label: "Today", icon: CalendarDays },
  { href: "/dashboard/timer", label: "Timer", icon: Clock },
  { href: "/dashboard/groups", label: "Groups", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="
        relative my-3 ml-3 flex w-56 flex-col
        rounded-2xl border border-zinc-800/60
        bg-zinc-900/70 px-3 py-5
        shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        backdrop-blur-xl
      "
    >
      {/* Subtle top glow line */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      {/* Logo */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 ring-1 ring-indigo-500/30">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-zinc-100">HabitFlow</h1>
            <p className="text-[10px] text-zinc-500">Track · Build · Grow</p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        Menu
      </p>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-indigo-600/20 text-indigo-300 shadow-[inset_0_1px_0_rgba(99,102,241,0.15)]"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
              )}
            >
              {/* Active left bar */}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors",
                  active ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom subtle gradient */}
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />
    </aside>
  )
}
