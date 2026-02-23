<script setup lang="ts">
/*
 * UCalendar has bad type definitions
 */
import type { CalendarDate } from '@internationalized/date'

import { getUCalendarTimedDate, getUCalendarToday, parseUCalendarDate } from '~/components/date/utils'
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

  trnsFormStore.values.date = getUCalendarTimedDate(date)
}
</script>

<template>
  <UCalendar
    v-model="date"
    :maxValue="maxDate"
    class="p-3"
    @update:modelValue="onUpdate"
  />
</template>
