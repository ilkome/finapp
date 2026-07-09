<script setup lang="ts">
import { useDateFormats } from '~/components/date/useDateFormats'
import { addCivilDays, isSameCivilDay, todayCivilDayEpoch } from '~/components/date/utils'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

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
  <DateNav
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
        <UiActionButton class="text-muted grid size-full content-center !justify-start px-2 text-left">
          <div class="text-highlighted text-sm">
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
  </DateNav>
</template>
