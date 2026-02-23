"use client"

import { useEffect, useState, useCallback } from "react"
import { Play, Pause, Square, RotateCcw, Check, Loader2, Clock, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDuration, cn } from "@/lib/utils"
import { useTimer, formatElapsed } from "@/hooks/useTimer"

interface Habit {
  id: string
  name: string
  category: string
  type: "CHECKBOX" | "TIMER"
  color: string
}

interface SavedEntry {
  habitName: string
  minutes: number
}

export default function TimerWidget() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loadingHabits, setLoadingHabits] = useState(true)
  const [selectedId, setSelectedId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<SavedEntry | null>(null)

  // Manual entry
  const [manualOpen, setManualOpen] = useState(false)
  const [manualHabitId, setManualHabitId] = useState<string>("")
  const [manualMinutes, setManualMinutes] = useState("")
  const [manualSaving, setManualSaving] = useState(false)
  const [manualSaved, setManualSaved] = useState(false)

  const { state, elapsed, start, pause, resume, stop, reset } = useTimer()

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/habits")
      if (res.ok) {
        const data: Habit[] = await res.json()
        setHabits(data)
        if (data.length > 0) {
          setManualHabitId(data[0].id)
        }
      }
      setLoadingHabits(false)
    }
    load()
  }, [])

  const selectedHabit = habits.find((h) => h.id === selectedId)

  const saveLog = useCallback(
    async (habitId: string, minutes: number) => {
      await fetch(`/api/today/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, duration: minutes }),
      })
    },
    []
  )

  async function handleStop() {
    const seconds = stop()
    if (seconds < 5 || !selectedId) return // ignore accidental stops
    const minutes = Math.max(1, Math.round(seconds / 60))
    setSaving(true)
    await saveLog(selectedId, minutes)
    setSaving(false)
    setLastSaved({ habitName: selectedHabit?.name ?? "", minutes })
  }

  async function handleManualSave() {
    const mins = parseInt(manualMinutes, 10)
    if (isNaN(mins) || mins <= 0 || !manualHabitId) return
    setManualSaving(true)
    await saveLog(manualHabitId, mins)
    setManualSaving(false)
    setManualSaved(true)
    setManualMinutes("")
    setTimeout(() => setManualSaved(false), 2500)
  }

  const isRunning = state === "running"
  const isPaused = state === "paused"
  const isIdle = state === "idle"

  return (
    <div className="space-y-6">
      {/* ---------- LIVE TIMER ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-amber-400" />
            Focus Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Habit selector */}
          <div className="space-y-1.5">
            {/* <Label htmlFor="timer-habit">Select habit</Label> */}
            {loadingHabits ? (
              <div className="flex h-9 items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : habits.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No habits yet. Create one in the{" "}
                <strong className="text-zinc-300">Habits</strong> tab.
              </p>
            ) : (
              <select
                id="timer-habit"
                value={selectedId}
                onChange={(e) => {
                  if (!isIdle) return
                  setSelectedId(e.target.value)
                }}
                disabled={!isIdle}
                className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="" disabled>
                  Select a habit 
                </option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.category}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Clock display */}
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Color accent — only when a habit is selected */}
            <div
              className="h-1.5 w-24 rounded-full transition-colors"
              style={{ backgroundColor: selectedHabit?.color ?? "transparent" }}
            />

            {/* Time display */}
            <div
              className={cn(
                "font-mono text-7xl font-bold tabular-nums tracking-tight transition-colors",
                isRunning
                  ? "text-zinc-100"
                  : isPaused
                  ? "text-amber-400"
                  : "text-zinc-500"
              )}
            >
              {formatElapsed(elapsed)}
            </div>

            {/* State label */}
            <p className="text-sm text-zinc-500">
              {isRunning
                ? `Tracking: ${selectedHabit?.name}`
                : isPaused
                ? "Paused"
                : selectedHabit
                ? "Ready to start"
                : "Select a habit to begin"}
            </p>
          </div>

              {/* Controls */}
              <div className="flex justify-center gap-2">
                {isIdle && (
                  <Button size="icon" onClick={start} title="Start" disabled={!selectedId} className="h-11 w-11">
                    <Play className="h-5 w-5" />
                  </Button>
                )}

                {isRunning && (
                  <>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={pause}
                      title="Pause"
                      className="h-11 w-11"
                    >
                      <Pause className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={handleStop}
                      disabled={saving}
                      title="Stop & Save"
                      className="h-11 w-11"
                    >
                      {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </Button>
                  </>
                )}

                {isPaused && (
                  <>
                    <Button size="icon" onClick={resume} title="Resume" className="h-11 w-11">
                      <Play className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={handleStop}
                      disabled={saving}
                      title="Stop & Save"
                      className="h-11 w-11"
                    >
                      {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={reset}
                      title="Discard"
                      className="h-11 w-11"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Saved confirmation */}
              {lastSaved && (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-800 bg-emerald-900/20 px-4 py-2.5 text-sm text-emerald-400">
                  <Check className="h-4 w-4" />
                  Saved{" "}
                  <strong>{formatDuration(lastSaved.minutes)}</strong> for{" "}
                  <strong>{lastSaved.habitName}</strong>
                </div>
              )}
        </CardContent>
      </Card>

      {/* ---------- MANUAL ENTRY ---------- */}
      <Card>
        <CardHeader
          className="cursor-pointer select-none py-3"
          onClick={() => setManualOpen((o) => !o)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Manual Time Entry</CardTitle>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-zinc-400 transition-transform duration-200",
                manualOpen && "rotate-180"
              )}
            />
          </div>
        </CardHeader>
        {manualOpen && <CardContent>
          <p className="mb-4 text-sm text-zinc-500">
            Already did something? Log time directly without the timer.
          </p>

          {loadingHabits ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : habits.length === 0 ? (
            <p className="text-sm text-zinc-500">No habits yet.</p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {/* Habit */}
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="manual-habit">Habit</Label>
                <select
                  id="manual-habit"
                  value={manualHabitId}
                  onChange={(e) => setManualHabitId(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.type === "TIMER" ? "⏱" : "✓"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Minutes */}
              <div className="w-36 space-y-1.5">
                <Label htmlFor="manual-minutes">Duration</Label>
                <div className="relative">
                  <Input
                    id="manual-minutes"
                    type="number"
                    min={1}
                    placeholder="30"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualSave()}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    min
                  </span>
                </div>
              </div>

              {/* Save */}
              <Button
                onClick={handleManualSave}
                disabled={manualSaving || !manualMinutes || !manualHabitId}
                className="h-9 shrink-0"
              >
                {manualSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : manualSaved ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" /> Saved
                  </>
                ) : (
                  "Log time"
                )}
              </Button>
            </div>
          )}
        </CardContent>}
      </Card>
    </div>
  )
}
