<script setup lang="ts">
/*
 * UCalendar has bad type definitions
 */
import type { CalendarDate } from '@internationalized/date'

import { calendarNavButton, getUCalendarCivilDate, getUCalendarToday, parseUCalendarDate } from '~~/utils/date/calendar'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  onClose: () => void
}>()

const trnsFormStore = useTrnsFormStore()
const date = ref(parseUCalendarDate(trnsFormStore.values.date))
const maxDate = getUCalendarToday()

function onUpdate(date: CalendarDate) {
  props.onClose()

  if (!date)
    return

  trnsFormStore.values.date = getUCalendarCivilDate(date)
}
</script>

<template>
  <!-- @vue-ignore -->
  <UCalendar
    v-model="date"
    :maxValue="maxDate"
    :prevMonth="calendarNavButton"
    :nextMonth="calendarNavButton"
    :prevYear="calendarNavButton"
    :nextYear="calendarNavButton"
    class="p-3"
    @update:modelValue="onUpdate"
  />
</template>
