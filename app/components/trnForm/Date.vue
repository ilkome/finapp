<script setup lang="ts">
import { addDays, isSameDay, subDays } from 'date-fns'

import { useDateFormats } from '~/components/date/useDateFormats'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const trnsFormStore = useTrnsFormStore()
const { formatDate } = useDateFormats()

const formattedDate = computed(() => {
  const date = formatDate(trnsFormStore.values.date, 'full')
  return `${date.day} ${date.month} <div class="text-2xs font-regular leading-none">${date.weekday}</div>`
})

const isToday = computed(() => {
  return isSameDay(new Date(trnsFormStore.values.date), new Date())
})

function changeDate(way: 'prev' | 'next' | 'today') {
  let newDate: number = new Date().getTime()

  if (way === 'prev')
    newDate = subDays(trnsFormStore.values.date, 1).getTime()

  if (way === 'next' && !isToday.value)
    newDate = addDays(trnsFormStore.values.date, 1).getTime()

  trnsFormStore.values.date = newDate
}
</script>

<template>
  <div class="-ml-1 flex gap-1">
    <UPopover class="grow">
      <div
        class="grid gap-1 rounded-md p-2 text-sm font-medium leading-none text-3 hocus:bg-item-hover"
        v-html="formattedDate"
      />

      <template #panel="{ close }">
        <TrnFormCalendar :hide="close" />
      </template>
    </UPopover>

    <StatDateNav
      :isShowNavHome="!isToday"
      :isEnd="isToday"
      :isStart="false"
      @changeDate="changeDate"
    />
  </div>
</template>
