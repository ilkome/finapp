<script setup lang="ts">
import dayjs from 'dayjs'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { formatDate } from '~/utils/formatDate'

const trnFormStore = useTrnFormStore()

const formattedDate = computed(() => {
  const date = formatDate(trnFormStore.values.date, 'full')
  return `${date.weekday} <br/> ${date.day} ${date.month}`
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
  <div class="flex items-stretch gap-2">
    <StatDateNav
      :isLastPeriod="false"
      :isToday="isToday"
      @setNextPeriodDate="changeDate('prev')"
      @setPeriodAndDate="changeDate('today')"
      @setPrevPeriodDate="changeDate('next')"
    />

    <VDropdown
      :overflowPadding="12"
      autoBoundaryMaxSize
      class="grow"
      placement="bottom-start"
    >
      <div
        class="flex items-center rounded-md px-3 py-2 text-xs leading-none hocus:bg-item-5"
        v-html="formattedDate"
      />

      <template #popper="{ hide }">
        <TrnFormCalendar :hide="hide" />
      </template>
    </VDropdown>
  </div>
</template>
