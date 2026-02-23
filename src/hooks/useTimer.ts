import { useState, useEffect, useRef, useCallback } from "react"

export type TimerState = "idle" | "running" | "paused"

interface UseTimerReturn {
  state: TimerState
  elapsed: number // seconds
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => number // returns elapsed seconds, then resets
  reset: () => void
}

export function useTimer(): UseTimerReturn {
  const [state, setState] = useState<TimerState>("idle")
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startTick = useCallback(() => {
    clearTick()
    intervalRef.current = setInterval(() => {
      setElapsed((s) => s + 1)
    }, 1000)
  }, [])

  useEffect(() => () => clearTick(), [])

  const start = useCallback(() => {
    setElapsed(0)
    setState("running")
    startTick()
  }, [startTick])

  const pause = useCallback(() => {
    clearTick()
    setState("paused")
  }, [])

  const resume = useCallback(() => {
    setState("running")
    startTick()
  }, [startTick])

  const stop = useCallback((): number => {
    clearTick()
    const seconds = elapsed
    setElapsed(0)
    setState("idle")
    return seconds
  }, [elapsed])

  const reset = useCallback(() => {
    clearTick()
    setElapsed(0)
    setState("idle")
  }, [])

  return { state, elapsed, start, pause, resume, stop, reset }
}

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
