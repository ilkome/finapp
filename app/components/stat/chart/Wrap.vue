<script setup lang="ts">
import dayjs from 'dayjs'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { ChartType } from '~/components/stat/chart/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  maxRange: Range
  series: unknown[]
  xAxisLabels: number[]
}>()

const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider
const trnsFormStore = useTrnFormStore()

const isShowDateSelector = defineModel('isShowDateSelector', {
  default: false,
})

function onClickChart(idx: number) {
  const newPeriod = idx

  if (statDate.params.value.intervalSelected === newPeriod) {
    statDate.params.value.intervalSelected = -1
  }
  else {
    statDate.params.value.intervalSelected = newPeriod

    if (statDate.params.value.intervalsBy === 'day' && statDate.params.value.intervalsDuration === 1) {
      const day = statDate.groupedPeriods.value[statDate.params.value.intervalSelected]?.start
      if (day) {
        trnsFormStore.values.date = day
      }
    }
  }
}
</script>

<template>
  <div
    :class="{
      '': statConfig.config.value?.chartView === 'full',
      'md:max-w-lg': statConfig.config.value?.chartView === 'half',
    }"
  >
    <div
      v-if="statConfig.config.value?.chartShow && (statDate.params.value.rangeDuration !== 1 || statDate.params.value.rangeBy !== 'day') && statDate.groupedPeriods.value.length > 1"
      class="pb-2"
    >
      <div class="flex justify-between">
        <LazyStatChartTypeSelector
          :chartType="statConfig.config.value?.chartType"
          @update:chartType="(value: ChartType) => statConfig.updateConfig('chartType', value)"
        />
        <LazyStatChartIntervals
          v-model:period="statDate.params.value.intervalsBy"
          :range="statDate.range.value"
        />
      </div>

      <StatChartView
        :xAxisLabels
        :chartType="statConfig.config.value?.chartType"
        :period="statDate.params.value.intervalsBy"
        :series="props.series"
        @click="onClickChart"
      />
    </div>

    <div class="flex items-end justify-between gap-2">
      <UiTitle10 @click="isShowDateSelector = !isShowDateSelector">
        <DateViewRange />
      </UiTitle10>

      <div
        v-if="!statDate.params.value.customDate"
        class="flex gap-1"
      >
        <DateNavHome
          v-if="statDate.params.value.intervalSelected !== -1 || (statDate.range.value.start !== dayjs().subtract(statDate.params.value.rangeDuration - 1, statDate.params.value.rangeBy).startOf(statDate.params.value.rangeBy).valueOf() && statDate.range.value.end !== dayjs().endOf(statDate.params.value.rangeBy).valueOf() && !statDate.params.value.isShowMaxRange)"
        />

        <DateNav
          v-if="!statDate.params.value.isShowMaxRange && (statDate.range.value.start < dayjs().valueOf() || (statDate.range.value.start !== maxRange.start && statDate.range.value.end !== maxRange.end))"
          :maxRange
        />
      </div>
    </div>
  </div>
</template>
