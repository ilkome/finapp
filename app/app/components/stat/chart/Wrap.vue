<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import type { useStatChartWindow } from '~/components/stat/chart/useStatChartWindow'
import type { ChartSeries } from '~/components/stat/types'

import { statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  chartWindow: ReturnType<typeof useStatChartWindow>
  series: ChartSeries[]
  xAxisLabels: number[]
}>()

const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
const trnsFormStore = useTrnsFormStore()

// Charts mount on the first idle frame so echarts doesn't compete with the LCP render.
const isChartMountReady = useIdleMount()
const isChartShow = computed(() => statConfig.config.value.chart.isShow)
const chartView = computed(() => statConfig.config.value.chart.view)
const chartType = computed(() => statConfig.config.value.chart.type)
const isShowQuick = computed(() => statConfig.config.value.date.isShowQuick)

async function onClickChart(intervalKey: number) {
  const day = await props.chartWindow.selectIntervalByKey(intervalKey)
  if (day)
    trnsFormStore.values.date = day
}

function onChangePeriod(period: Period) {
  statDate.setGranularityBy(period)
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
      <StatDateQuickRanges v-if="isShowQuick" />

      <div class="h-7">
        <StatChartIntervalSelect
          :class="{ 'border-l border-accented': isShowQuick }"
          :period="statDate.params.value.granularityBy"
          :range="statDate.range.value"
          @changePeriod="onChangePeriod"
        />
      </div>
    </div>

    <!-- Reserve the chart height on this always-present box. The height must live here, not on a placeholder that the idle mount swaps out: the
         chart is a lazy component, so between isChartMountReady flipping and its chunk resolving the
         box would otherwise collapse for a frame and shift the whole page (CLS). -->
    <div class="min-h-40 @3xl/stat:min-h-52">
      <LazyStatChartAxisView
        v-if="isChartMountReady"
        :chartType
        :bufferSize="props.chartWindow.bufferIntervals.value.length"
        :commitCount="props.chartWindow.commitCount.value"
        :endValue="props.chartWindow.endValue.value"
        :isPannable="props.chartWindow.isEnabled.value"
        :panOffset="statDate.params.value.rangePanOffset"
        :period="statDate.params.value.granularityBy"
        :series="props.series"
        :startValue="props.chartWindow.startValue.value"
        :xAxisLabels="props.xAxisLabels"
        @click="onClickChart"
        @preview="props.chartWindow.onPreview"
        @previewEnd="props.chartWindow.commitPreview()"
      />
    </div>
  </div>
</template>
