import { differenceInCalendarDays, parseISO, format, subDays, startOfDay } from "date-fns"

export interface StreakResult {
  current: number
  longest: number
}

/**
 * Given a list of date strings (yyyy-MM-dd) on which the habit was completed,
 * calculate the current and longest streaks.
 */
export function calcStreaks(completedDates: string[]): StreakResult {
  if (completedDates.length === 0) return { current: 0, longest: 0 }

  // Deduplicate and sort descending
  const unique = Array.from(new Set(completedDates)).sort((a, b) =>
    b.localeCompare(a)
  )

  const today = format(startOfDay(new Date()), "yyyy-MM-dd")
  const yesterday = format(subDays(startOfDay(new Date()), 1), "yyyy-MM-dd")

  // Current streak — walk backwards from today or yesterday
  let current = 0
  const mostRecent = unique[0]
  if (mostRecent === today || mostRecent === yesterday) {
    let expected = mostRecent
    for (const d of unique) {
      if (d === expected) {
        current++
        expected = format(
          subDays(parseISO(expected), 1),
          "yyyy-MM-dd"
        )
      } else {
        break
      }
    }
  }

  // Longest streak — slide through sorted-ascending list
  const asc = [...unique].sort()
  let longest = 1
  let run = 1
  for (let i = 1; i < asc.length; i++) {
    const gap = differenceInCalendarDays(parseISO(asc[i]), parseISO(asc[i - 1]))
    if (gap === 1) {
      run++
      if (run > longest) longest = run
    } else if (gap > 1) {
      run = 1
    }
  }

  return { current, longest: Math.max(longest, current) }
}
