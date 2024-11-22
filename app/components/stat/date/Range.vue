<script setup lang="ts">
import dayjs from 'dayjs'
import type { Range, StatDateProvider } from '~/components/date/types'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

const statDate = inject('statDate') as StatDateProvider
const { t } = useI18n()
const { getStringDateRange } = useGetDateRange(t)

const range = computed<Range>(() => {
  return statDate.params.value.intervalSelected !== -1
    ? statDate.groupedPeriods.value[statDate.params.value.intervalSelected]
      ? statDate.groupedPeriods.value[statDate.params.value.intervalSelected]!
      : statDate.range.value
    : statDate.range.value
})

const date = computed(() => {
  const isIntervalSelected = statDate.params.value.intervalSelected !== -1
  const intervalsBy = isIntervalSelected ? statDate.params.value.intervalsBy : statDate.params.value.rangeBy
  const rangeDuration = isIntervalSelected ? statDate.params.value.intervalsDuration : statDate.params.value.rangeDuration

  return `${getStringDateRange(range.value, intervalsBy, rangeDuration)}`
})
</script>

<template>
  <div class="!first-letter:text-accent-1 flex gap-1 leading-none">
    {{ date }}
  </div>
</template>
