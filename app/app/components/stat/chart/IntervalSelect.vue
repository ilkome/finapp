<script setup lang="ts">
import type { Period, Range } from '~~/utils/date/types'

import { availableGranularities } from '~/components/stat/chart/granularity'

const props = defineProps<{
  period: Period
  range: Range
}>()

const emit = defineEmits<{
  changePeriod: [value: Period]
}>()

const { t } = useI18n()

const labels: Record<Period, string> = {
  day: 'dates.day.simple',
  month: 'dates.month.simple',
  week: 'dates.week.simple',
  year: 'dates.year.simple',
}

const availableIntervals = computed(() =>
  availableGranularities(props.period, props.range).map(value => ({
    label: t(labels[value]),
    value,
  })),
)
</script>

<template>
  <USelect
    v-if="availableIntervals.length > 1"
    :modelValue="period"
    :items="availableIntervals"
    :ui="{
      base: 'ring-0 text-muted text-2xs hover:bg-elevated',
      trailingIcon: 'size-4',
      content: 'w-24',
    }"
    @update:modelValue="emit('changePeriod', $event as Period)"
  />
</template>
