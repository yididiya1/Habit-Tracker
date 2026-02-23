"use client"

import { useState } from "react"
import { Pencil, Trash2, Clock, CheckSquare, Flame, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import HabitForm from "./HabitForm"
import HabitStatsModal from "./HabitStatsModal"

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

interface HabitCardProps {
  habit: Habit
  streak?: number
  onDelete: (id: string) => void
  onUpdate: () => void
}

export default function HabitCard({ habit, streak = 0, onDelete, onUpdate }: HabitCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${habit.name}"? This will archive all logs.`)) return
    setDeleting(true)
    await fetch(`/api/habits/${habit.id}`, { method: "DELETE" })
    onDelete(habit.id)
    setDeleting(false)
  }

  return (
    <>
      <div className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 transition-colors hover:border-zinc-700">
        {/* Color indicator */}
        <div
          className="h-10 w-1 flex-shrink-0 rounded-full"
          style={{ backgroundColor: habit.color }}
        />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-zinc-100">{habit.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {habit.category}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              {habit.type === "TIMER" ? (
                <>
                  <Clock className="h-3 w-3" /> Timer
                </>
              ) : habit.type === "COUNT" ? (
                <>
                  <CheckSquare className="h-3 w-3" /> Count {habit.targetCount ? `(goal: ${habit.targetCount})` : ""}
                </>
              ) : (
                <>
                  <CheckSquare className="h-3 w-3" /> Checkbox
                </>
              )}
            </span>
            {habit.scheduleDays.length > 0 && (
              <span className="text-xs text-zinc-600">
                {habit.scheduleDays.join(" · ")}
              </span>
            )}
            {streak > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-orange-400">
                <Flame className="h-3 w-3" />
                {streak}d
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStatsOpen(true)}
            title="View stats"
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditOpen(true)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <HabitForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onUpdate}
        initialData={habit}
      />
      <HabitStatsModal
        habitId={statsOpen ? habit.id : null}
        habitName={habit.name}
        onClose={() => setStatsOpen(false)}
      />
    </>
  )
}
