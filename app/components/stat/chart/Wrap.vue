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
    v-if="statConfig.config.value?.chartShow"
    :class="{
      '@3xl/main:max-w-xl': props.chartView === 'half',
    }"
  >
    <div class="flex justify-end -mb-1">
      <slot />

      <div class="h-7">
        <StatChartIntervals
          :class="{ 'border-l border-item-4': statConfig.config.value?.date.isShowQuick }"
          :period="statDate.params.value.intervalsBy"
          :range="statDate.range.value"
          @onChangePeriod="onChangePeriod"
        />
      </div>
    </div>

    <StatChartView
      :chartType="statConfig.config.value?.chartType"
      :period="statDate.params.value.intervalsBy"
      :series="props.series"
      :xAxisLabels="props.xAxisLabels"
      @click="onClickChart"
    />
  </div>
</template>
