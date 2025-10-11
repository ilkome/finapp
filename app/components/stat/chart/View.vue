<script setup lang="ts">
import defu from 'defu'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { DataZoomComponent, GridComponent, MarkAreaComponent, MarkLineComponent, MarkPointComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { Period } from '~/components/date/types'
import type { PeriodNameWithAll } from '~/components/filter/types'
import type { ChartType } from '~/components/stat/chart/types'

import { formatByLocale } from '~/components/date/utils'
import { config, lineConfig } from '~/components/stat/chart/config'
import { getLocalAmount } from '~/components/stat/chart/utils'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

type ChartParams = {
  color?: string
  name: string
  seriesName: string
  value: number
}

const props = withDefaults(
  defineProps<{
    chartType?: ChartType
    isShowDataLabels?: boolean
    isShowExpense?: boolean
    isShowIncome?: boolean
    isShowSummary?: boolean
    period: Period
    series: unknown[]
    xAxisLabels: number[]
  }>(),
  {
    chartType: 'line',
    config: () => ({}),
    isShowExpense: true,
    isShowIncome: true,
  },
)

const emit = defineEmits<{
  click: [idx: number]
}>()

use([
  BarChart,
  DataZoomComponent,
  GridComponent,
  LineChart,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  PieChart,
  SVGRenderer,
  TooltipComponent,
])

const { locale, t } = useI18n()
const { getStringDateRange } = useGetDateRange(t, locale.value)
const chartRef = ref()

function getFormatForChart(periodName: PeriodNameWithAll) {
  switch (periodName) {
    case 'day':
      return 'd MMM'
    case 'week':
      return 'd MMM'
    case 'month':
      return 'MMM'
    case 'year':
      return 'yyyy'
    default:
      return 'MM'
  }
}

const option = computed(() => {
  const data = defu(config, {
    series: setChartSeries(props.series),
    xAxis: {
      data: props.xAxisLabels,
      type: 'category',
    },
  })

  data.xAxis.axisLabel.formatter = (date: string) => {
    if (props.period === 'day') {
      return getStringDateRange({
        end: new Date(+date).getTime(),
        start: new Date(+date).getTime(),
      }, 'day', 1)
    }

    return formatByLocale(new Date(+date), getFormatForChart(props.period, new Date(+date)), locale.value)
  }
  data.xAxis.axisPointer.label.formatter = ({ value }: { value: string }) => {
    return formatByLocale(new Date(+value), getFormatForChart(props.period, new Date(+value)), locale.value)
  }

  return data
})

async function onClickChart(params: { offsetX: number, offsetY: number }) {
  const [index] = chartRef.value.convertFromPixel('grid', [
    params.offsetX,
    params.offsetY,
  ])

  emit('click', index)
}

function setChartSeries(series: unknown[]) {
  return series
    .map((item: any) => ({
      ...defu(lineConfig, item),
      label: {
        ...lineConfig.label,
        show: props.isShowDataLabels,
      },
      stack: (props.chartType || item.type) === 'bar' ? 'b' : false,
      type: item.markedArea ? 'bar' : (props.chartType || item.type),
    }))
}
</script>

<template>
  <div
    class="h-40 @3xl/page:h-52"
    @click="onClickChart"
  >
    <VChart
      ref="chartRef"
      :option
      autoresize
    >
      <template #tooltip="params">
        <div class="rounded-md bg-[var(--item-5)] px-2 pt-2">
          <div class="text-muted pb-2 text-xs">
            {{ formatByLocale(new Date(+params[0].name), getFormatForChart(props.period), locale) }}
          </div>

          <div class="grid gap-0">
            <div
              v-for="(param, i) in params" :key="i"
              class="border-item-6 flex items-center justify-between gap-4 border-b pb-1 last:border-b-0"
            >
              <div class="flex items-center gap-2">
                <div class="size-2.5 rounded-full" :style="`background: ${param.color}`" />
                <div class="text-muted text-sm">
                  {{ param.seriesName }}
                </div>
              </div>

              <div class="font-secondary text-1 text-right text-lg">
                {{ getLocalAmount(param.value) }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </VChart>
  </div>
</template>
