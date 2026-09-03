<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'

import { differenceInDays } from 'date-fns'
import { getUCalendarCivilDate, getUCalendarToday, parseUCalendarDate } from '~~/utils/date/calendar'
import { createRangeFormatter } from '~~/utils/date/labels'

import { historyFiltersKey } from '~/components/trns/history/injectionKeys'

type CalendarRange = {
  end: CalendarDate
  start: CalendarDate
}

const filters = inject(historyFiltersKey)!
const { locale, t } = useI18n()
const isOpen = ref(false)
const dateRange = ref<CalendarRange>()
const hasDate = computed(() => filters.dateStart.value !== null || filters.dateEnd.value !== null)
const { formatRangeExact } = createRangeFormatter(t, locale.value)
const label = computed(() => {
  if (filters.dateStart.value === null || filters.dateEnd.value === null)
    return t('trns.historyTable.filters.period')

  return formatRangeExact({
    by: 'day',
    duration: differenceInDays(filters.dateEnd.value, filters.dateStart.value) + 1,
    end: new Date(filters.dateEnd.value),
    start: new Date(filters.dateStart.value),
  })
})

function syncRange() {
  dateRange.value = filters.dateStart.value !== null && filters.dateEnd.value !== null
    ? {
        end: parseUCalendarDate(filters.dateEnd.value),
        start: parseUCalendarDate(filters.dateStart.value),
      }
    : undefined
}

watch([filters.dateStart, filters.dateEnd], syncRange, { immediate: true })

function onOpen() {
  isOpen.value = true
}

function selectRange(value: CalendarRange | undefined, close: () => void) {
  dateRange.value = value
  if (!value?.start || !value.end)
    return
  filters.setDateRange(getUCalendarCivilDate(value.start), getUCalendarCivilDate(value.end))
  close()
}

function clear(close: () => void) {
  filters.setDateRange(null, null)
  dateRange.value = undefined
  close()
}
</script>

<template>
  <BottomSheetOrDropdown
    :isOpen="isOpen"
    :title="t('trns.historyTable.filters.period')"
    popoverBodyClass="md:pb-3"
    popoverContentClass="md:w-96 md:max-w-[calc(100vw-1rem)]"
    :unmountOnHide="false"
    isShowCloseBtn
    @closeModal="isOpen = false"
    @openModal="onOpen"
  >
    <template #trigger="{ isActive }">
      <UiTitleDropdown :isActive>
        <span class="text-nowrap capitalize">{{ label }}</span>
      </UiTitleDropdown>
    </template>

    <template #content="{ close }">
      <div class="grid min-w-0 gap-2 pb-2 md:min-w-90.5 md:px-1 md:pb-0">
        <!-- @vue-ignore -->
        <UCalendar
          :modelValue="dateRange"
          :maxValue="getUCalendarToday()"
          :numberOfMonths="2"
          range
          @update:modelValue="value => selectRange(value as CalendarRange | undefined, close)"
        />
        <button
          v-if="hasDate"
          type="button"
          class="justify-self-end px-2 text-sm text-muted hover:text-highlighted"
          @click="clear(close)"
        >
          {{ t('base.clear') }}
        </button>
      </div>
    </template>
  </BottomSheetOrDropdown>
</template>
