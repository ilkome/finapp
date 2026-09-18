<script setup lang="ts">
import type { Range } from '~~/utils/date/types'

import type { Grouped } from '~/components/stat/date/types'
import type { StatDateRangeOption } from '~/components/stat/date/useRangeOptions'

import { useStatDateRangeOptions } from '~/components/stat/date/useRangeOptions'
import { statDateKey } from '~/components/stat/injectionKeys'

const emit = defineEmits<{
  close: []
}>()

const statDate = inject(statDateKey)!
const isGranularityOpen = useStoredToggle('stat-date-granularity', true)
const { options } = useStatDateRangeOptions()

function onSelectRange(option: StatDateRangeOption) {
  if (option.view === 'maximum')
    statDate.setMaxRange(option.isSkipEmpty)
  else
    statDate.setRangeByPeriod({ ...option.range, label: option.label })
}

function onSelectGranularityBy(granularityBy: Grouped['granularityBy']) {
  statDate.setGranularity({ granularityBy, granularityDuration: 1 })
}

function onSetRangeByCalendar(range: Range) {
  statDate.setRangeByCalendar(range)
}
</script>

<template>
  <StatDateRangePickerView
    v-model:isGranularityOpen="isGranularityOpen"
    :granularity="{
      granularityBy: statDate.params.value.granularityBy,
      granularityDuration: statDate.params.value.granularityDuration,
    }"
    :options
    :params="statDate.params.value"
    :range="statDate.range.value"
    @close="emit('close')"
    @selectGranularityBy="onSelectGranularityBy"
    @selectRange="onSelectRange"
    @setGranularityDuration="statDate.setGranularityDuration"
    @setRangeByCalendar="onSetRangeByCalendar"
    @setRangeDuration="statDate.setRangeDuration"
  />
</template>
