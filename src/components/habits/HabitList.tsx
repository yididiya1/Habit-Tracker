"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import HabitCard from "./HabitCard"
import HabitForm from "./HabitForm"

interface Habit {
  id: string
  name: string
  category: string
  type: "CHECKBOX" | "TIMER" | "COUNT"
  color: string
  targetCount: number | null
  scheduleDays: string[]
  createdAt: string
}

export default function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState("All")
  const [streakMap, setStreakMap] = useState<Record<string, number>>({})

  async function fetchHabits() {
    setLoading(true)
    const [habitsRes, streaksRes] = await Promise.all([
      fetch("/api/habits"),
      fetch("/api/analytics/streaks"),
    ])
    if (habitsRes.ok) {
      const data = await habitsRes.json()
      setHabits(data)
    }
    if (streaksRes.ok) {
      const data = await streaksRes.json()
      const map: Record<string, number> = {}
      for (const h of data.habits ?? []) {
        map[h.id] = h.currentStreak
      }
      setStreakMap(map)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  const categories = ["All", ...Array.from(new Set(habits.map((h) => h.category)))]

  const filtered = habits.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === "All" || h.category === filterCategory
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">My Habits</h2>
          <p className="text-sm text-zinc-500">
            {habits.length} habit{habits.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Habit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search habits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center">
          <p className="text-zinc-500">
            {habits.length === 0
              ? "No habits yet. Create your first one!"
              : "No habits match your search."}
          </p>
          {habits.length === 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Habit
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={streakMap[habit.id] ?? 0}
              onDelete={(id) => setHabits((prev) => prev.filter((h) => h.id !== id))}
              onUpdate={fetchHabits}
            />
          ))}
        </div>
      )}

      <HabitForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchHabits}
      />
    </div>
  )
}
