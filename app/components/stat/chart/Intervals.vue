<script setup lang="ts">
import { differenceInDays } from 'date-fns'
import type { Range } from '~/components/date/types'

const props = defineProps<{
  range: Range
}>()

const period = defineModel('period', {
  default: 'day',
})

const { t } = useI18n()

const items = computed(() => {
  const dayDiff = differenceInDays(props.range.end, props.range.start)

  const items = [{
    isShow: period.value !== 'day' || dayDiff > 7,
    label: t('dates.day.simple'),
    value: 'day',
  }, {
    isShow: dayDiff >= 7,
    label: t('dates.week.simple'),
    value: 'week',
  }, {
    isShow: dayDiff >= 30,
    label: t('dates.month.simple'),
    value: 'month',
  }, {
    isShow: dayDiff >= 400,
    label: t('dates.year.simple'),
    value: 'year',
  }]

  return items.filter(i => i.isShow)
})
</script>

<template>
  <div class="flex gap-0">
    <DateLinkItem2
      v-for="item in items"
      :key="item.value"
      :isActive="period === item.value"
      @click="period = item.value"
    >
      {{ item.label }}
    </DateLinkItem2>
  </div>
</template>
