"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const CATEGORIES = [
  "Health & Fitness",
  "Learning",
  "Work",
  "Mindfulness",
  "Social",
  "Creative",
  "Other",
]

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
]

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const
type Day = (typeof DAYS)[number]
type HabitType = "CHECKBOX" | "TIMER" | "COUNT"

interface HabitFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: {
    id: string
    name: string
    category: string
    type: HabitType
    color: string
    targetCount?: number | null
    scheduleDays?: string[]
  }
}

export default function HabitForm({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: HabitFormProps) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0])
  const [type, setType] = useState<HabitType>(initialData?.type ?? "CHECKBOX")
  const [color, setColor] = useState(initialData?.color ?? COLORS[0])
  const [targetCount, setTargetCount] = useState(
    initialData?.targetCount?.toString() ?? ""
  )
  const [scheduleDays, setScheduleDays] = useState<Day[]>(
    (initialData?.scheduleDays as Day[]) ?? []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEditing = !!initialData

  function toggleDay(day: Day) {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = isEditing ? `/api/habits/${initialData.id}` : "/api/habits"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          type,
          color,
          targetCount:
            type === "COUNT" && targetCount ? parseInt(targetCount) : null,
          scheduleDays,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Something went wrong")
      }

      onSuccess()
      onOpenChange(false)
      if (!isEditing) {
        setName("")
        setCategory(CATEGORIES[0])
        setType("CHECKBOX")
        setColor(COLORS[0])
        setTargetCount("")
        setScheduleDays([])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const TYPE_OPTIONS: { value: HabitType; label: string; desc: string }[] = [
    { value: "CHECKBOX", label: "✓ Checkbox", desc: "Done / not done" },
    { value: "TIMER", label: "⏱ Timer", desc: "Track time spent" },
    { value: "COUNT", label: "# Count", desc: "Track a number goal" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Habit" : "Create Habit"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Habit name</Label>
            <Input
              id="name"
              placeholder="e.g. Drink water"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Tracking type</Label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 text-sm transition-colors ${
                    type === t.value
                      ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-medium">{t.label}</span>
                  <span className="text-[11px] opacity-70">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target count (COUNT only) */}
          {type === "COUNT" && (
            <div className="space-y-1.5">
              <Label htmlFor="targetCount">Daily target</Label>
              <div className="relative">
                <Input
                  id="targetCount"
                  type="number"
                  min={1}
                  placeholder="e.g. 10"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  className="pr-20"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                  times/day
                </span>
              </div>
            </div>
          )}

          {/* Active days */}
          <div className="space-y-1.5">
            <Label>Active days</Label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setScheduleDays([])}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  scheduleDays.length === 0
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                Every day
              </button>
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    scheduleDays.includes(day)
                      ? "bg-indigo-600 text-white"
                      : "border border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-600">
              {scheduleDays.length === 0
                ? "Runs every day"
                : `Active on: ${scheduleDays.join(", ")}`}
            </p>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c
                      ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                      : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEditing ? "Save changes" : "Create habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
