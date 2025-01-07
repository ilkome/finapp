<script setup lang="ts">
import type { Period, StatDateProvider } from '~/components/date/types'
import type { ChartSeries } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  series: ChartSeries[]
  xAxisLabels: number[]
}>()

const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider
const trnsFormStore = useTrnsFormStore()

function onClickChart(idx: number) {
  const newPeriod = idx

  // Handle when click outside of chart
  if (newPeriod === statDate.intervalsInRange.value.length) {
    statDate.params.value.intervalSelected = -1
    return
  }

  // Handle when click on the same period
  if (statDate.params.value.intervalSelected === newPeriod) {
    statDate.params.value.intervalSelected = -1
  }
  else {
    statDate.params.value.intervalSelected = newPeriod

    if (statDate.params.value.intervalsBy === 'day' && statDate.params.value.intervalsDuration === 1) {
      const day = statDate.intervalsInRange.value[statDate.params.value.intervalSelected]?.start
      if (day) {
        trnsFormStore.values.date = day
      }
    }
  }
}

const isShowChart = computed(() => {
  return statConfig.config.value?.chartShow && (statDate.params.value.rangeDuration !== 1 || statDate.params.value.rangeBy !== 'day') && statDate.intervalsInRange.value.length > 1
})

function onChangePeriod(period: Period) {
  statDate.params.value.intervalSelected = -1
  statDate.params.value.intervalsBy = period
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
      v-if="isShowChart"
      class="pb-2"
    >
      <div class="flex justify-end">
        <!-- <StatChartTypeSelector
          :chartType="statConfig.config.value?.chartType"
          @click="(value: ChartType) => statConfig.updateConfig('chartType', value)"
        /> -->
        <StatChartIntervals
          :period="statDate.params.value.intervalsBy"
          :range="statDate.range.value"
          @onChangePeriod="onChangePeriod"
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
  </div>
</template>
