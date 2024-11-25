<script setup lang="ts">
import type { Range, StatDateProvider } from '~/components/date/types'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

const statDate = inject('statDate') as StatDateProvider
const { locale, t } = useI18n()

const { getStringDateRange } = useGetDateRange(t, locale.value)

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
  <div class="!first-letter:text-accent-1 flex items-center gap-1 leading-none">
    {{ date }}
    <data
      v-if="statDate.params.value.isShowMaxRange"
      class="bg-item-3 text-2xs text-4 flex items-center rounded px-1 py-px leading-none"
    >max</data>
  </div>
</template>
