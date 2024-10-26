<script setup lang="ts">
import dayjs from 'dayjs'
import { formatDate } from '~/components/date/format'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const trnFormStore = useTrnFormStore()

const formattedDate = computed(() => {
  const date = formatDate(trnFormStore.values.date, 'full')
  return `${date.day} ${date.month} <div class="text-2xs font-regular leading-none">${date.weekday}</div>`
})

const isToday = computed(() => {
  return dayjs().isSame(trnFormStore.values.date, 'day')
})

function changeDate(way: 'prev' | 'next' | 'today') {
  let newDate: number = dayjs().valueOf()

  if (way === 'prev')
    newDate = dayjs(trnFormStore.values.date).subtract(1, 'day').valueOf()

  if (way === 'next' && !isToday.value)
    newDate = dayjs(trnFormStore.values.date).add(1, 'day').valueOf()

  if (way === 'today')
    newDate = dayjs().valueOf()

  trnFormStore.values.date = newDate
}
</script>

<template>
  <div class="flex gap-1 -ml-1">
    <UPopover class="grow">
      <div
        class="grid gap-1 rounded-md px-2 py-2 text-sm font-medium text-3 leading-none hocus:bg-item-5"
        v-html="formattedDate"
      />

      <template #panel="{ close }">
        <TrnFormCalendar :hide="close" />
      </template>
    </UPopover>

    <StatDateNav
      :isLastPeriod="false"
      :isToday="isToday"
      @setNextPeriodDate="changeDate('prev')"
      @setPeriodAndDate="changeDate('today')"
      @setPrevPeriodDate="changeDate('next')"
    />
  </div>
</template>
