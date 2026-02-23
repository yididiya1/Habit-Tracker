"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"

const EMOJIS = ["🎯", "🏃", "📚", "💪", "🧘", "🥗", "💧", "🛌", "✍️", "🎸", "🧠", "🌅"]
const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"]
const HABIT_TYPES = ["CHECKBOX", "TIMER", "COUNT"] as const

interface Props {
  onClose: () => void
}

export default function CreateGroupModal({ onClose }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [emoji, setEmoji] = useState("🎯")
  const [color, setColor] = useState("#6366f1")
  const [endDate, setEndDate] = useState("")

  const [habitName, setHabitName] = useState("")
  const [habitType, setHabitType] = useState<"CHECKBOX" | "TIMER" | "COUNT">("CHECKBOX")
  const [targetCount, setTargetCount] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !habitName.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, emoji, color,
          endDate: endDate || null,
          habit: { name: habitName, type: habitType, color, targetCount: targetCount ? parseInt(targetCount) : null },
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const group = await res.json()
      router.push(`/dashboard/groups/${group.id}`)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-100">Create a Group</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Emoji + Name */}
          <div className="flex gap-3">
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="grid grid-cols-6 gap-1">
                {EMOJIS.map((e) => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    className={`rounded-lg p-1.5 text-lg transition-colors ${emoji === e ? "bg-indigo-600/30 ring-1 ring-indigo-500" : "hover:bg-zinc-800"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="group-name">Group Name *</Label>
              <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Morning Warriors" required />
              <Label htmlFor="group-desc" className="pt-2 block">Description</Label>
              <Input id="group-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-white/40" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* End date (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="end-date">Challenge End Date <span className="text-zinc-500">(optional)</span></Label>
            <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-48" />
          </div>

          {/* Habit */}
          <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/40 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Group Habit</p>
            <div className="space-y-1.5">
              <Label htmlFor="habit-name">Habit Name *</Label>
              <Input id="habit-name" value={habitName} onChange={(e) => setHabitName(e.target.value)} placeholder="Run 5km" required />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label>Type</Label>
                <div className="flex gap-1">
                  {HABIT_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setHabitType(t)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${habitType === t ? "bg-indigo-600 text-white" : "bg-zinc-700/60 text-zinc-400 hover:bg-zinc-700"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {habitType === "COUNT" && (
                <div className="w-28 space-y-1.5">
                  <Label htmlFor="target">Daily Target</Label>
                  <Input id="target" type="number" min={1} value={targetCount} onChange={(e) => setTargetCount(e.target.value)} placeholder="10" />
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim() || !habitName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Group"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
