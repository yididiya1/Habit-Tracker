import TimerWidget from "@/components/timer/TimerWidget"

export const metadata = { title: "Timer — HabitFlow" }

export default function TimerPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Timer</h2>
        <p className="text-sm text-zinc-500">
          Start a focused timer or manually log time for any habit.
        </p>
      </div>
      <div className="max-w-xl">
        <TimerWidget />
      </div>
    </div>
  )
}
