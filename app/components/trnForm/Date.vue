<script setup lang="ts">
import { addDays, isSameDay, subDays } from 'date-fns'

import { useDateFormats } from '~/components/date/useDateFormats'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const { formatDate } = useDateFormats()

const formattedDate = computed(() => formatDate(trnsFormStore.values.date, 'full') as { day: string, full: string, month: string, week: string, weekday: string } | undefined)
const isToday = computed(() => isSameDay(new Date(trnsFormStore.values.date), new Date()))
const isShow = ref(false)

function changeDate(way: 'prev' | 'next' | 'today') {
  let newDate: number = Date.now()

  if (way === 'prev')
    newDate = subDays(trnsFormStore.values.date, 1).getTime()

  if (way === 'next' && !isToday.value)
    newDate = addDays(trnsFormStore.values.date, 1).getTime()

  trnsFormStore.values.date = newDate
}
</script>

<template>
  <div class="flex gap-1">
    <BottomSheetOrDropdown
      :title="t('common.date')"
      :isOpen="isShow"
      isShowCloseBtn
      @openModal="isShow = true"
      @closeModal="isShow = false"
    >
      <template #trigger>
        <UiActionButton class="text-2 grid w-full !justify-start p-2 text-left">
          <div class="text-1 text-sm">
            {{ formattedDate?.day }} {{ formattedDate?.month }}
          </div>
          <div class="font-regular text-2xs leading-none">
            {{ formattedDate?.weekday }}
          </div>
        </UiActionButton>
      </template>

      <template #content="{ close }">
        <div class="min-w-80">
          <TrnFormCalendar :onClose="close" />
        </div>
      </template>
    </BottomSheetOrDropdown>

    <DateNav
      :isShowNavHome="!isToday"
      :isEnd="isToday"
      :isStart="false"
      @changeDate="changeDate"
    />
  </div>
</template>
