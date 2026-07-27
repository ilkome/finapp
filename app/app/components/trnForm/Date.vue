<script setup lang="ts">
import { addCivilDays, isSameCivilDay, todayCivilDayEpoch } from '~~/utils/date/civil'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useDateFormats } from '~/composables/useDateFormats'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const { formatDate } = useDateFormats()

const formattedDate = computed(() => formatDate(trnsFormStore.values.date, 'full') as { day: string, full: string, month: string, week: string, weekday: string } | undefined)
const isToday = computed(() => isSameCivilDay(trnsFormStore.values.date, todayCivilDayEpoch()))
const isShow = ref(false)

function changeDate(way: 'prev' | 'next' | 'today') {
  let newDate: number = todayCivilDayEpoch()

  if (way === 'prev')
    newDate = addCivilDays(trnsFormStore.values.date, -1)

  if (way === 'next' && !isToday.value)
    newDate = addCivilDays(trnsFormStore.values.date, 1)

  trnsFormStore.values.date = newDate
}
</script>

<template>
  <UiNavArrows
    class="grow"
    :isShowNavHome="!isToday"
    :isEnd="isToday"
    :isStart="false"
    @changeDate="changeDate"
  >
    <BottomSheetOrDropdown
      :title="t('common.date')"
      :isOpen="isShow"
      class="grow"
      isShowCloseBtn
      @openModal="isShow = true"
      @closeModal="isShow = false"
    >
      <template #trigger>
        <UiActionButton class="grid size-full content-center justify-start! px-2 text-left text-muted">
          <div class="text-sm text-highlighted">
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
  </UiNavArrows>
</template>
