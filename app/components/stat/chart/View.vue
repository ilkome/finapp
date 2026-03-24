<script setup lang="ts">
import defu from 'defu'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { Period } from '~/components/date/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries } from '~/components/stat/types'

import { formatByLocale } from '~/components/date/utils'
import { config, defaultSeriesConfig } from '~/components/stat/chart/config'
import { formatChartAmount } from '~/components/stat/chart/utils'

type TooltipParam = {
  color: string
  name: string
  seriesName: string
  value: number
}

const {
  chartType = 'line',
  period,
  series,
  xAxisLabels,
} = defineProps<{
  chartType?: ChartType
  period: Period
  series: ChartSeries[]
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  click: [idx: number]
}>()

use([
  BarChart,
  GridComponent,
  LineChart,
  MarkAreaComponent,
  MarkLineComponent,
  SVGRenderer,
  TooltipComponent,
])

const { locale } = useI18n()
const chartRef = ref()

function getFormatForChart(periodName: Period) {
  switch (periodName) {
    case 'day':
    case 'week':
      return 'd MMM'
    case 'month':
      return 'MMM'
    case 'year':
      return 'yyyy'
  }
}

const option = computed(() => {
  const data = defu(config, {
    series: buildChartSeries(series),
    xAxis: {
      data: xAxisLabels,
      type: 'category',
    },
  })

  const xAxis = data.xAxis as Record<string, any>
  xAxis.axisLabel.formatter = (date: string) => {
    return formatByLocale(new Date(+date), getFormatForChart(period), locale.value)
  }

  xAxis.axisPointer.label.formatter = ({ value }: { value: string }) => {
    return formatByLocale(new Date(+value), getFormatForChart(period), locale.value)
  }

  const yAxis = data.yAxis as Record<string, any>
  yAxis.axisPointer.label.formatter = (props: { value: number }) =>
    formatChartAmount(+props.value, locale.value) ?? ''

  return data
})

async function onClickChart(params: { offsetX: number, offsetY: number }) {
  const [index] = chartRef.value.convertFromPixel('grid', [
    params.offsetX,
    params.offsetY,
  ])

  emit('click', index)
}

function buildChartSeries(series: ChartSeries[]) {
  return series
    .map((item: ChartSeries) => ({
      ...defu(defaultSeriesConfig, item),
      label: defaultSeriesConfig.label,
      stack: (chartType || item.type) === 'bar' ? 'b' : false,
      type: item.markedArea ? 'bar' : (chartType || item.type),
    }))
}
</script>

<template>
  <div
    class="h-40 @3xl/stat:h-52"
    @click="onClickChart"
  >
    <VChart
      ref="chartRef"
      :option
      :updateOptions="{ notMerge: true }"
      autoresize
    >
      <template #tooltip="params">
        <div class="rounded-md bg-(--item-5) px-2 pt-2">
          <div class="text-muted pb-2 text-xs">
            {{ formatByLocale(new Date(+(params as TooltipParam[])[0]!.name), getFormatForChart(period), locale) }}
          </div>

          <div class="grid gap-0">
            <div
              v-for="(param, i) in (params as TooltipParam[])" :key="i"
              class="border-item-6 flex items-center justify-between gap-4 border-b pb-1 last:border-b-0"
            >
              <div class="flex items-center gap-2">
                <div class="size-2.5 rounded-full" :style="`background: ${param.color}`" />
                <div class="text-muted text-sm">
                  {{ param.seriesName }}
                </div>
              </div>

              <div class="font-secondary text-1 text-right text-lg">
                {{ formatChartAmount(param.value, locale) }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </VChart>
  </div>
</template>
