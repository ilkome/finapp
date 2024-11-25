<script setup lang="ts">
import type { IntervalGroupedLabel, Range, StatDateProvider } from '~/components/date/types'

const statDate = inject('statDate') as StatDateProvider

const { t } = useI18n()

const intervalGroups = computed<IntervalGroupedLabel[]>(() => [
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: t('dates.day.simple'),
    rangeBy: 'day',
    rangeDuration: 1,
  },
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: t('dates.week.simple'),
    rangeBy: 'week',
    rangeDuration: 1,
  },
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: t('dates.month.simple'),
    rangeBy: 'month',
    rangeDuration: 1,
  },
  {
    intervalsBy: 'month',
    intervalsDuration: 1,
    label: t('dates.year.simple'),
    rangeBy: 'year',
    rangeDuration: 1,
  },
])

function isRangeSelected(rd: IntervalGroupedLabel) {
  return rd.rangeDuration === statDate.params.value.rangeDuration && rd.rangeBy === statDate.params.value.rangeBy
}

function selectRange(igl: IntervalGroupedLabel) {
  statDate.setRangeByPeriod(igl)
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
