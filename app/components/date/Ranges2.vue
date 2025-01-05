<script setup lang="ts">
import type { IntervalGroupedLabel, StatDateProvider } from '~/components/date/types'

const emit = defineEmits<{
  onClose: []
}>()

const statDate = inject('statDate') as StatDateProvider
const { t } = useI18n()

const intervalGroups = computed<IntervalGroupedLabel[]>(() => [
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: `7${t('dates.day.short')}`,
    rangeBy: 'day',
    rangeDuration: 7,
  },
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: `14${t('dates.day.short')}`,
    rangeBy: 'day',
    rangeDuration: 14,
  },
  {
    intervalsBy: 'day',
    intervalsDuration: 1,
    label: `30${t('dates.day.short')}`,
    rangeBy: 'day',
    rangeDuration: 30,
  },
  {
    intervalsBy: 'month',
    intervalsDuration: 1,
    label: `3${t('dates.month.short')}`,
    rangeBy: 'month',
    rangeDuration: 3,
  },
  {
    intervalsBy: 'month',
    intervalsDuration: 1,
    label: `6${t('dates.month.short')}`,
    rangeBy: 'month',
    rangeDuration: 6,
  },
  {
    intervalsBy: 'month',
    intervalsDuration: 1,
    label: `12${t('dates.month.short')}`,
    rangeBy: 'month',
    rangeDuration: 12,
  },
  {
    intervalsBy: 'year',
    intervalsDuration: 1,
    label: `6${t('dates.year.short')}`,
    rangeBy: 'year',
    rangeDuration: 6,
  },
])

function isRangeSelected(rd: IntervalGroupedLabel) {
  return rd.rangeDuration === statDate.params.value.rangeDuration && rd.rangeBy === statDate.params.value.rangeBy
}

function selectRange(igl: IntervalGroupedLabel) {
  statDate.setRangeByPeriod(igl)
  emit('onClose')
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
