import type { IntervalGroupedLabel } from '~/components/stat/date/types'

export const quickRangeOptionIds = [
  'period:day-1',
  'period:week-1',
  'period:month-1',
  'period:month-6',
  'period:year-1',
  'preset:day-7',
  'preset:day-14',
  'preset:day-30',
  'preset:month-3',
  'preset:month-6',
  'preset:month-12',
  'preset:year-6',
  'maximum:all',
  'maximum:allSkipEmpty',
] as const

export type QuickRangeOptionId = typeof quickRangeOptionIds[number]
export type StatDateRangeView = 'maximum' | 'periods' | 'presets'

export const defaultQuickRangeOptionIds: QuickRangeOptionId[] = quickRangeOptionIds.slice(0, 5)

export function normalizeQuickRangeOrderIds(value: unknown): QuickRangeOptionId[] {
  const source = Array.isArray(value) ? value : []
  const valid = new Set<QuickRangeOptionId>(quickRangeOptionIds)
  const seen = new Set<QuickRangeOptionId>()
  const result: QuickRangeOptionId[] = []

  for (const item of source) {
    if (valid.has(item as QuickRangeOptionId) && !seen.has(item as QuickRangeOptionId)) {
      const id = item as QuickRangeOptionId
      seen.add(id)
      result.push(id)
    }
  }

  for (const id of quickRangeOptionIds) {
    if (!seen.has(id))
      result.push(id)
  }

  return result
}

type PeriodRangeOption = {
  id: QuickRangeOptionId
  label: string
  range: IntervalGroupedLabel
  view: Exclude<StatDateRangeView, 'maximum'>
}

type MaximumRangeOption = {
  id: QuickRangeOptionId
  isSkipEmpty: boolean
  label: string
  view: 'maximum'
}

export type StatDateRangeOption = MaximumRangeOption | PeriodRangeOption

export function useStatDateRangeOptions() {
  const { t } = useI18n()

  function durationLabel(value: number, unit: 'day' | 'month' | 'year') {
    return `${value} ${t(`dates.${unit}.plural`, value)}`
  }

  const options = computed<StatDateRangeOption[]>(() => [
    {
      id: 'period:day-1',
      label: t('dates.day.simple'),
      range: { granularityBy: 'day', granularityDuration: 1, rangeBy: 'day', rangeDuration: 1 },
      view: 'periods',
    },
    {
      id: 'period:week-1',
      label: t('dates.week.simple'),
      range: { granularityBy: 'day', granularityDuration: 1, rangeBy: 'week', rangeDuration: 1 },
      view: 'periods',
    },
    {
      id: 'period:month-1',
      label: t('dates.month.simple'),
      range: { granularityBy: 'day', granularityDuration: 1, rangeBy: 'month', rangeDuration: 1 },
      view: 'periods',
    },
    {
      id: 'period:month-6',
      label: t('dates.halfYear.simple'),
      range: { granularityBy: 'month', granularityDuration: 1, rangeBy: 'month', rangeDuration: 6 },
      view: 'periods',
    },
    {
      id: 'period:year-1',
      label: t('dates.year.simple'),
      range: { granularityBy: 'month', granularityDuration: 1, rangeBy: 'year', rangeDuration: 1 },
      view: 'periods',
    },
    {
      id: 'preset:day-7',
      label: durationLabel(7, 'day'),
      range: { granularityBy: 'day', granularityDuration: 1, rangeBy: 'day', rangeDuration: 7 },
      view: 'presets',
    },
    {
      id: 'preset:day-14',
      label: durationLabel(14, 'day'),
      range: { granularityBy: 'day', granularityDuration: 1, rangeBy: 'day', rangeDuration: 14 },
      view: 'presets',
    },
    {
      id: 'preset:day-30',
      label: durationLabel(30, 'day'),
      range: { granularityBy: 'day', granularityDuration: 1, rangeBy: 'day', rangeDuration: 30 },
      view: 'presets',
    },
    {
      id: 'preset:month-3',
      label: durationLabel(3, 'month'),
      range: { granularityBy: 'week', granularityDuration: 1, rangeBy: 'month', rangeDuration: 3 },
      view: 'presets',
    },
    {
      id: 'preset:month-6',
      label: durationLabel(6, 'month'),
      range: { granularityBy: 'month', granularityDuration: 1, rangeBy: 'month', rangeDuration: 6 },
      view: 'presets',
    },
    {
      id: 'preset:month-12',
      label: durationLabel(12, 'month'),
      range: { granularityBy: 'month', granularityDuration: 1, rangeBy: 'month', rangeDuration: 12 },
      view: 'presets',
    },
    {
      id: 'preset:year-6',
      label: durationLabel(6, 'year'),
      range: { granularityBy: 'year', granularityDuration: 1, rangeBy: 'year', rangeDuration: 6 },
      view: 'presets',
    },
    { id: 'maximum:all', isSkipEmpty: false, label: t('dates.ranges.all'), view: 'maximum' },
    { id: 'maximum:allSkipEmpty', isSkipEmpty: true, label: t('dates.ranges.allSkipEmpty'), view: 'maximum' },
  ])

  return { options }
}
