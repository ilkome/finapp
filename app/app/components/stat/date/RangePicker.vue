<script setup lang="ts">
import type { Range } from '~~/utils/date/types'

import { useStorage } from '@vueuse/core'

import type { Grouped, StatDateParams } from '~/components/stat/date/types'
import type { StatDateRangeOption } from '~/components/stat/date/useRangeOptions'

import { STAT_STORAGE_KEYS } from '~/components/stat/constants'
import { useStatDateRangeOptions } from '~/components/stat/date/useRangeOptions'
import { statDateKey } from '~/components/stat/injectionKeys'

defineProps<{
  isSheet?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const statDate = inject(statDateKey)!
const isGranularityOpen = useStorage(STAT_STORAGE_KEYS.dateGranularityOpen, true)
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

function onSelectRangeBy(rangeBy: StatDateParams['rangeBy']) {
  statDate.setRangeByPeriod({
    granularityBy: statDate.params.value.granularityBy,
    granularityDuration: statDate.params.value.granularityDuration,
    rangeBy,
    rangeDuration: statDate.params.value.rangeDuration,
  })
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
    :isSheet
    :options
    :params="statDate.params.value"
    :range="statDate.range.value"
    @close="emit('close')"
    @selectGranularityBy="onSelectGranularityBy"
    @selectRangeBy="onSelectRangeBy"
    @selectRange="onSelectRange"
    @setGranularityDuration="statDate.setGranularityDuration"
    @setRangeByCalendar="onSetRangeByCalendar"
    @setRangeDuration="statDate.setRangeDuration"
  />
</template>
