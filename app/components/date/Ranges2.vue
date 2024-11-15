<script setup lang="ts">
import type { IntervalGroupedLabel, StatDateProvider } from '~/components/date/types'

const emit = defineEmits<{
  close: []
}>()

const statDate = inject('statDate') as StatDateProvider

const intervalGroups = computed<IntervalGroupedLabel[]>(() => [
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: '7d',
    rangeBy: 'day',
    rangeDuration: 7,
  },
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: '14d',
    rangeBy: 'day',
    rangeDuration: 14,
  },
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: '30d',
    rangeBy: 'day',
    rangeDuration: 30,
  },
  {
    intervalsBy: 'month',
    intervalsDuration: 1,
    label: '6m',
    rangeBy: 'month',
    rangeDuration: 6,
  },
  {
    intervalsBy: 'month',
    intervalsDuration: 1,
    label: '12m',
    rangeBy: 'month',
    rangeDuration: 12,
  },
  {
    intervalsBy: 'year',
    intervalsDuration: 1,
    label: '6y',
    rangeBy: 'year',
    rangeDuration: 6,
  },
  {
    intervalsBy: 'year',
    intervalsDuration: 1,
    label: '10y',
    rangeBy: 'year',
    rangeDuration: 10,
  },
])

function isRangeSelected(rd: IntervalGroupedLabel) {
  return rd.rangeDuration === statDate.params.value.rangeDuration && rd.rangeBy === statDate.params.value.rangeBy
}

function selectRange(igl: IntervalGroupedLabel) {
  statDate.setRangeByPeriod(igl)
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
