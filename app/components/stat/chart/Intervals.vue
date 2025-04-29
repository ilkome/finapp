<script setup lang="ts">
import { differenceInDays } from 'date-fns'

import type { Period, Range } from '~/components/date/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

const emit = defineEmits<{
  onChangePeriod: [value: Period]
}>()

const { t } = useI18n()

const items = computed(() => {
  const dayDiff = differenceInDays(props.range.end, props.range.start)

  const items = [{
    isShow: props.period !== 'day' || dayDiff > 7,
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

const value = ref(props.period)
</script>

<template>
  <USelect
    v-if="items.length > 1"
    v-model="value"
    :items="items"
    :ui="{
      base: 'ring-0 text-muted text-2xs hover:bg-[var(--item-5)]',
      trailingIcon: 'size-4',
      content: 'w-24',
    }"
    @change="emit('onChangePeriod', value)"
  />
</template>
