<script setup lang="ts">
import type { Period, Range } from '~~/utils/date/types'

import { afterNextPaint } from '~~/utils/afterNextPaint'

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

// The stat page recomputes in the task that applies a grouping, so the pick is shown from here and
// emitted after it paints (and after the menu starts closing).
const pending = shallowRef<Period>()
watch(() => props.period, () => pending.value = undefined)
function onPick(value: Period) {
  pending.value = value
  afterNextPaint(() => {
    if (pending.value === value)
      emit('changePeriod', value)
  })
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
    data-reka-swipe-ignore
    :modelValue="pending ?? period"
    :items="availableIntervals"
    :ui="{
      base: 'ring-0 text-muted text-2xs hover:bg-elevated',
      trailingIcon: 'size-4',
      content: 'w-24',
    }"
    @update:modelValue="onPick($event as Period)"
  />
</template>
