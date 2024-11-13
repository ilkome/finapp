<script setup lang="ts">
import type { IntervalGroupedLabel, IntervalRangeProvider, Range } from '~/components/date/types'

const emit = defineEmits<{
  close: []
}>()

const intervalRange = inject('intervalRange') as IntervalRangeProvider

const { t } = useI18n()

const intervalGroups = computed<IntervalGroupedLabel[]>(() => [
  {
    groupedBy: 'day',
    groupedDuration: 1,
    intervalDuration: 1,
    intervalPeriod: 'day',
    label: t('dates.day.simple'),
  },
  {
    groupedBy: 'day',
    groupedDuration: 1,
    intervalDuration: 1,
    intervalPeriod: 'week',
    label: t('dates.week.simple'),
  },
  {
    groupedBy: 'day',
    groupedDuration: 1,
    intervalDuration: 1,
    intervalPeriod: 'month',
    label: t('dates.month.simple'),
  },
  {
    groupedBy: 'month',
    groupedDuration: 1,
    intervalDuration: 1,
    intervalPeriod: 'year',
    label: t('dates.year.simple'),
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
