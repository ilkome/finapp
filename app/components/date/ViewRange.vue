<script setup lang="ts">
import dayjs from 'dayjs'
import type { Range, StatDateProvider } from '~/components/date/types'

const { t } = useI18n()

const statDate = inject('statDate') as StatDateProvider

const range = computed<Range>(() => {
  return statDate.params.value.intervalSelected !== -1
    ? statDate.groupedPeriods.value[statDate.params.value.intervalSelected]
      ? statDate.groupedPeriods.value[statDate.params.value.intervalSelected]!
      : statDate.range.value
    : statDate.range.value
})

const date = computed(() => {
  const today = dayjs()
  const start = dayjs(range.value.start)
  const end = dayjs(range.value.end)
  const { intervalsBy, isShowMaxRange, rangeBy, rangeDuration } = statDate.params.value

  // Helper functions
  const formatRange = (startFormat: string, endFormat: string) =>
    `${start.format(startFormat)} - ${end.format(endFormat)}`

  // Handle specific time periods
  const periodHandlers = {
    day: () => {
      if (!start.isSame(end, 'day') || intervalsBy !== 'day')
        return null
      if (start.isToday())
        return t('dates.day.current')
      if (start.isYesterday())
        return t('dates.day.yesterday')
      return start.format(start.isSame(today, 'year') ? 'D MMMM' : 'D MMMM YYYY')
    },

    month: () => {
      if (!start.isSame(end, 'month') || rangeBy !== 'month')
        return null
      if (start.isSame(today, 'month'))
        return t('dates.month.current')
      if (start.isSame(today.subtract(1, 'month'), 'month'))
        return t('dates.month.last')
      return start.format(start.isSame(today, 'year') ? 'MMMM' : 'MMMM YYYY')
    },

    week: () => {
      if (!start.isSame(end, 'week') || rangeBy !== 'week')
        return null
      if (start.isSame(today, 'week'))
        return t('dates.week.current')
      if (start.isSame(today.subtract(1, 'week'), 'week'))
        return t('dates.week.last')

      if (start.isSame(end, 'month'))
        return formatRange('D', 'D MMMM')
      if (start.isSame(today, 'year'))
        return formatRange('D MMMM', 'D MMMM')
      if (start.isSame(end, 'year'))
        return formatRange('D MMMM', 'D MMMM YYYY')
      return formatRange('D MMMM YY', 'D MMMM YY')
    },

    year: () => {
      if (!start.isSame(end, 'year') || rangeBy !== 'year')
        return null
      if (start.isSame(today, 'year'))
        return t('dates.year.current')
      if (start.isSame(today.subtract(1, 'year'), 'year'))
        return t('dates.year.last')
      return start.format('YYYY')
    },
  }

  // Try each period handler
  for (const handler of Object.values(periodHandlers)) {
    const result = handler()
    if (result)
      return result
  }

  // Handle last periods
  if (!isShowMaxRange && end.isSame(today, rangeBy)) {
    return `${t('dates.last')} ${rangeDuration} ${t(`dates.${rangeBy}.simple`)}`
  }

  // Default formatting
  if (start.isSame(today, 'week'))
    return t('dates.week.current')
  if (start.isSame(today.subtract(1, 'week'), 'week'))
    return t('dates.week.last')
  if (start.isSame(today, 'month'))
    return formatRange('D', 'D MMMM')
  if (start.isSame(today, 'year'))
    return formatRange('D MMMM', 'D MMMM')
  return formatRange('D MMMM YYYY', 'D MMMM YYYY')
})
</script>

<template>
  <div class="!first-letter:text-accent-1 flex gap-1 leading-none">
    {{ date }}
  </div>
</template>
