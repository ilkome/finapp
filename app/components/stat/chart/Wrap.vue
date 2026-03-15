<script setup lang="ts">
import type { Period } from '~/components/date/types'
import type { ChartSeries } from '~/components/stat/types'

import { statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

defineProps<{
  series: ChartSeries[]
  xAxisLabels: number[]
}>()

const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
const trnsFormStore = useTrnsFormStore()

const isChartShow = computed(() => statConfig.config.value.isChartShow)
const chartView = computed(() => statConfig.config.value.chartView)
const chartType = computed(() => statConfig.config.value.chartType)
const isShowQuick = computed(() => statConfig.config.value.date.isShowQuick)

function onClickChart(idx: number) {
  const day = statDate.selectInterval(idx)
  if (day)
    trnsFormStore.values.date = day
}

function onChangePeriod(period: Period) {
  statDate.setIntervalsBy(period)
}
</script>

<template>
  <div
    v-if="isChartShow"
    :class="{
      '@3xl/main:max-w-xl': chartView === 'half',
    }"
  >
    <div class="-mb-1 flex justify-end">
      <StatDateQuick v-if="isShowQuick" />

      <div class="h-7">
        <StatChartIntervals
          :class="{ 'border-item-4 border-l': isShowQuick }"
          :period="statDate.params.value.intervalsBy"
          :range="statDate.range.value"
          @changePeriod="onChangePeriod"
        />
      </div>
    </div>

    <LazyStatChartView
      :chartType
      :period="statDate.params.value.intervalsBy"
      :series
      :xAxisLabels
      @click="onClickChart"
    />
  </div>
</template>
