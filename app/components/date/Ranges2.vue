<script setup lang="ts">
import type { IntervalGroupedLabel, IntervalRangeProvider } from '~/components/date/types'

const emit = defineEmits<{
  close: []
}>()

const intervalRange = inject('intervalRange') as IntervalRangeProvider

const intervalGroups = computed<IntervalGroupedLabel[]>(() => [
  {
    groupedBy: 'day',
    groupedDuration: 1,
    intervalDuration: 7,
    intervalPeriod: 'day',
    label: '7d',
  },
  {
    groupedBy: 'day',
    groupedDuration: 1,
    intervalDuration: 14,
    intervalPeriod: 'day',
    label: '14d',
  },
  {
    groupedBy: 'day',
    groupedDuration: 1,
    intervalDuration: 30,
    intervalPeriod: 'day',
    label: '30d',
  },
  {
    groupedBy: 'month',
    groupedDuration: 1,
    intervalDuration: 6,
    intervalPeriod: 'month',
    label: '6m',
  },
  {
    groupedBy: 'month',
    groupedDuration: 1,
    intervalDuration: 12,
    intervalPeriod: 'month',
    label: '12m',
  },
  {
    groupedBy: 'year',
    groupedDuration: 1,
    intervalDuration: 6,
    intervalPeriod: 'year',
    label: '6y',
  },
  {
    groupedBy: 'year',
    groupedDuration: 1,
    intervalDuration: 10,
    intervalPeriod: 'year',
    label: '10y',
  },
])

function isRangeSelected(rd: IntervalGroupedLabel) {
  return rd.intervalDuration === intervalRange.params.value.intervalDuration && rd.intervalPeriod === intervalRange.params.value.intervalPeriod
}

function selectRange(igl: IntervalGroupedLabel) {
  intervalRange.setRangeByPeriod(igl)
  emit('close')
}
</script>

<template>
  <DateLinkItem
    v-for="igl in intervalGroups"
    :key="igl.label"
    :isActive="isRangeSelected(igl)"
    @click="selectRange(igl)"
  >
    {{ igl.label }}
  </DateLinkItem>
</template>
