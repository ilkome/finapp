<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import type { AxisChartType, ChartType } from '~/components/stat/chart/types'
import type { useStatChartWindow } from '~/components/stat/chart/useStatChartWindow'
import type { ChartSeries } from '~/components/stat/types'

import { statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  chartType: ChartType
  chartWindow: ReturnType<typeof useStatChartWindow>
  series: ChartSeries[]
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  select: [intervalKey?: number]
}>()

const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
const trnsFormStore = useTrnsFormStore()

// Charts mount on the first idle frame so echarts doesn't compete with the LCP render.
const isChartMountReady = useIdleMount()
const isChartShow = computed(() => statConfig.config.value.chart.isShow)
const chartLayout = computed(() => statConfig.config.value.chart.layout)
const chartType = computed(() => props.chartType)
const axisChartType = computed<AxisChartType>(() => chartType.value === 'pie' ? 'bar' : chartType.value)

async function onClickChart(intervalKey: number) {
  emit('select', intervalKey)
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
    class="relative max-w-full min-w-0"
    :class="{
      'stat-column-width': chartLayout === 'combined-narrow',
    }"
  >
    <div
      class="-mb-1 flex h-8 items-center gap-1"
    >
      <div class="h-7" :class="{ invisible: chartType === 'pie' }">
        <StatChartIntervalSelect
          :period="statDate.params.value.granularityBy"
          :range="statDate.range.value"
          @changePeriod="onChangePeriod"
        />
      </div>
    </div>

    <div
      class="absolute z-10"
      :class="statConfig.config.value.chart.isShowBackground
        ? '-top-1 -right-1 md:-top-2 md:-right-2'
        : 'top-1 right-1'"
    >
      <StatChartSettingsPopover />
    </div>

    <div class="min-h-40 max-w-full min-w-0 @3xl/stat:min-h-52">
      <LazyStatChartSimplePieView
        v-if="isChartMountReady && chartType === 'pie'"
        :endValue="props.chartWindow.endValue.value"
        :isDonut="statConfig.config.value.chart.pie.shape === 'donut'"
        :isShowLabels="statConfig.config.value.chart.pie.isShowLabels"
        :isShowPercent="statConfig.config.value.chart.pie.isShowPercent"
        :series="props.series"
        :startValue="props.chartWindow.startValue.value"
        :xAxisLabels="props.xAxisLabels"
        @select="emit('select')"
      />
      <LazyStatChartAxisView
        v-else-if="isChartMountReady"
        :chartType="axisChartType"
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
