<script setup lang="ts">
import dayjs from 'dayjs'
import type { Range } from '~/components/date/types'

const props = defineProps<{
  range: Range
}>()

const period = defineModel('period', {
  default: 'day',
})

const { t } = useI18n()

const items = computed(() => {
  const items = [{
    isShow: period.value !== 'day' || dayjs(props.range.end).diff(props.range.start, 'day') > 7,
    // isShow: true,
    label: t('dates.day.simple'),
    value: 'day',
  }, {
    isShow: dayjs(props.range.end).diff(props.range.start, 'day') >= 7,
    label: t('dates.week.simple'),
    value: 'week',
  }, {
    isShow: dayjs(props.range.end).diff(props.range.start, 'day') >= 30,
    label: t('dates.month.simple'),
    value: 'month',
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
