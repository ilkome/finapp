<script setup lang="ts">
import type { Period, StatDateProvider } from '~/components/date/types'
import type { ChartSeries } from '~/components/stat/types'
import type { MiniItemConfig, StatConfigProvider } from '~/components/stat/useStatConfig'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  chartView: MiniItemConfig['chartView']
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
      if (day)
        trnsFormStore.values.date = day
    }
  }
}

function onChangePeriod(period: Period) {
  statDate.params.value.intervalSelected = -1
  statDate.params.value.intervalsBy = period
}
</script>

<template>
  <div
    :class="{
      'md:max-w-lg': props.chartView === 'half',
    }"
    class="bg-item-2 mb-3 rounded-xl p-2"
  >
    <div
      v-if="statConfig.config.value?.chartShow"
      class="pb-2"
    >
      <div class="flex justify-end">
        <slot />

        <StatChartIntervals
          :class="{ 'border-item-4 border-l': statConfig.config.value?.date.isShowQuick }"
          :period="statDate.params.value.intervalsBy"
          :range="statDate.range.value"
          @onChangePeriod="onChangePeriod"
        />
      </div>

      <StatChartView
        :chartType="statConfig.config.value?.chartType"
        :period="statDate.params.value.intervalsBy"
        :series="props.series"
        :xAxisLabels="props.xAxisLabels"
        @click="onClickChart"
      />
    </div>
  </div>
</template>
