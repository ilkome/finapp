<script setup lang="ts">
import dayjs from 'dayjs'
import { useDateFormats } from '~/components/date/useDateFormats'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const { formatDate } = useDateFormats()

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
  <div class="-ml-1 flex gap-1">
    <UPopover class="grow">
      <div
        class="text-3 hocus:bg-item-5 grid gap-1 rounded-md p-2 text-sm font-medium leading-none"
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
