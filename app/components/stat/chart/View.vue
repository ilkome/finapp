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
    tooltip: {
      ...config.tooltip,
      formatter(params: ChartParams[]) {
        let content = '<div class="px-1">'
        content = `${content}
          <div class="text-md pb-2 text-muted text-right">${formatByLocale(new Date(+params[0].name), getFormatForChart(props.period), locale.value)}</div>
          <div class="grid gap-1">
        `

        for (const param of params) {
          const value = `

          <div class="flex justify-between items-center gap-4 border-b border-item-6 pb-1 last:border-b-0">
            <div class="flex items-center gap-2">
              <div class="size-3 rounded-full" style="background: ${param.color}"></div>
              <div>${param.seriesName}</div>
            </div>

            <div class="text-lg text-right font-secondary text-1">
              ${getLocalAmount(param.value)}
            </div>
          </div>
          `
          content = content + value
        }

        return `${content}</div></div>`
      },
    },
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
    class="@3xl/page:h-52 h-40"
    @click="onClickChart"
  >
    <VChart
      ref="chartRef"
      :option
      autoresize
    />
  </div>
</template>
