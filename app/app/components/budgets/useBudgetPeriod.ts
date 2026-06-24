import { UTCDate } from '@date-fns/utc'
import { useStorage } from '@vueuse/core'
import { differenceInDays, sub } from 'date-fns'

import type { BudgetPeriodType } from '~/components/budgets/types'
import type { Range } from '~/components/date/types'

import { getEndOf, getStartOf, todayCivilDayEpoch, toDuration } from '~/components/date/utils'

// How many prior periods the rollover walk may reach back over (bounded so the walk is cheap;
// leading empty periods are trimmed per-budget in useBudgetProgress).
const ROLLOVER_HISTORY = 12

/**
 * Single global budget period (v1, variant A): a period type (week/month/year, persisted) plus an
 * offset (0 = current, negative = past). Derives the range, the day counts for pace/projection, and
 * the prior period starts used by the rollover walk. All boundaries are computed in UTC (civil
 * model), so they are device-independent. See plans/budgets.md §6.
 */
export function useBudgetPeriod() {
  const periodType = useStorage<BudgetPeriodType>('finapp.budget.periodType', 'month')
  const offset = ref(0)

  const anchor = computed(() => sub(new UTCDate(todayCivilDayEpoch()), toDuration(periodType.value, -offset.value)))

  const range = computed<Range>(() => ({
    end: getEndOf(anchor.value, periodType.value).getTime(),
    start: getStartOf(anchor.value, periodType.value).getTime(),
  }))

  function rangeForStart(periodStart: number): Range {
    const d = new UTCDate(periodStart)
    return { end: getEndOf(d, periodType.value).getTime(), start: getStartOf(d, periodType.value).getTime() }
  }

  // Ascending period starts strictly before the current one (oldest first).
  const periodStartsBefore = computed<number[]>(() => {
    const starts: number[] = []
    for (let i = ROLLOVER_HISTORY; i >= 1; i--) {
      const d = sub(anchor.value, toDuration(periodType.value, i))
      starts.push(getStartOf(d, periodType.value).getTime())
    }
    return starts
  })

  const daysInPeriod = computed(() => differenceInDays(range.value.end, range.value.start) + 1)

  const daysElapsed = computed(() => {
    const today = todayCivilDayEpoch()
    if (today < range.value.start)
      return 0
    if (today > range.value.end)
      return daysInPeriod.value
    return differenceInDays(today, range.value.start) + 1
  })

  function prev() {
    offset.value -= 1
  }
  function next() {
    if (offset.value < 0)
      offset.value += 1
  }
  function reset() {
    offset.value = 0
  }

  return {
    anchor,
    daysElapsed,
    daysInPeriod,
    next,
    offset,
    periodStartsBefore,
    periodType,
    prev,
    range,
    rangeForStart,
    reset,
  }
}

export type BudgetPeriodProvider = ReturnType<typeof useBudgetPeriod>
