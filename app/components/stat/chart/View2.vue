<script setup lang="ts">
import VChart from 'vue-echarts'
import defu from 'defu'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { DataZoomComponent, DatasetComponent, GridComponent, MarkAreaComponent, MarkLineComponent, MarkPointComponent, TooltipComponent, TransformComponent } from 'echarts/components'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption } from 'echarts/charts'
import type {
  DatasetComponentOption,
  GridComponentOption,
} from 'echarts/components'
import type { ChartType } from '~/components/stat/chart/types'
import type { Period } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import { config, lineConfig } from '~/components/stat/chart/config'
import { formatByLocale, getFormatForChart } from '~/components/date/utils'
import { getLocalAmount, setChartXAxis } from '~/components/stat/chart/utils'

const props = withDefaults(
  defineProps<{
    chartType: ChartType
    isShowDataLabels?: boolean
    isShowExpense?: boolean
    isShowIncome?: boolean
    isShowSummary?: boolean
    period: Period
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
  DatasetComponent,
  GridComponent,
  TransformComponent,
  BarChart,
  CanvasRenderer,
])

type EChartsOption = ComposeOption<
  | DatasetComponentOption
  | GridComponentOption
  | BarSeriesOption
>

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

const { locale } = useI18n()
const statConfig = inject('statConfig') as StatConfigProvider
const chartRef = ref()

const option = computed<EChartsOption>(() => ({
  // xAxis: {
  //   data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  //   type: 'category',
  // },
  dataset: {
    dimensions: ['name', '2015', '2016'],
    source: [
      { 2015: 43.3, 2016: 85.8, 2017: 93.7, date: '123', name: 'Income' },
      { 2015: 83.1, 2016: 73.4, 2017: 55.1, date: '123', name: 'Expense' },
    ],
  },

  series: [{ type: 'bar' }, { type: 'bar' }],
  // series: [
  //   { type: 'bar' },
  //   { type: 'bar' },
  //   { type: 'bar' },
  //   { type: 'bar' },
  // ],
  // dataset: {
  //   // dimensions: ['score', 'amount', 'product'],
  //   source: [
  //     {
  //       date: 'date1',
  //       expense: 280,
  //       income: 130,
  //     },
  //     {
  //       date: 'date2',
  //       expense: 180,
  //       income: 120,
  //     },
  //     {
  //       date: 'date3',
  //       expense: 80,
  //       income: 1200,
  //     },
  //   ],
  // },

  // series: [
  //   {
  //     encode: {
  //       x: 'date',
  //       y: 'expense',
  //     },
  //     type: 'bar',
  //   },
  //   {
  //     encode: {
  //       x: 'date',
  //       y: 'income',
  //     },
  //     type: 'bar',
  //   },
  // ],

  tooltip: {
    // ...config.tooltip,
    // formatter(params) {
    //   console.log(params)

    //   // let content = '<div class="px-1">'
    //   // content = `${content}
    //   //     <div class="text-md pb-2 text-2 text-right">${formatByLocale(new Date(+params[0].name), getFormatForChart(props.period), locale.value)}</div>
    //   //     <div class="grid gap-1">
    //   //   `

    //   // for (const param of params) {
    //   //   const value = `<div class="text-md text-right font-secondary text-1">${getLocalAmount(param.value)}</div>`
    //   //   content = content + value
    //   // }

    //   // return `${content}</div></div>`
    // },
  },
  // series: [
  //   {
  //     encode: {
  //       x: 'product',
  //       y: '2015',
  //     },
  //     name: '2015',
  //     type: 'bar',
  //   },
  //   {
  //     encode: {
  //       x: 'product',
  //       y: '2016',
  //     },
  //     name: '2016',
  //     type: 'bar',
  //   },
  //   {
  //     encode: {
  //       x: 'product',
  //       y: '2017',
  //     },
  //     name: '2017',
  //     type: 'bar',
  //   },
  // ],
  xAxis: {
    type: 'category',
  },
  // xAxis: {
  //   axisLabel: { interval: 0, rotate: 30 },
  // },

  yAxis: {},

  // yAxis: {},

  // encode: {
  //   tooltip: ['product', 'type'],
  // },

  // encode: {
  // // Map "Dimension 1", "Dimension 5" and "dimension named 'score'" to x-axis:
  //   x: 1,
  //   // Map "Dimension 0" to y-axis:
  //   y: 2,
  // },

  // series: [
  //   { seriesLayoutBy: 'column', type: 'bar' },
  // ],

  // series: [{ type: 'bar', seriesLayoutBy: 'row']},

  //     // return `${content}</div></div>`
  //   },
  // },
  // xAxis: {
  //   axisLabel: { interval: 0, rotate: 30 },
  //   type: 'category',
  // },

  // tooltip: {
  //   ...config.tooltip,
  //   formatter(params) {
  //     console.log(params)

  //     // let content = '<div class="px-1">'
  //     // content = `${content}
  //     //     <div class="text-md pb-2 text-2 text-right">${formatByLocale(new Date(+params[0].name), getFormatForChart(props.period), locale.value)}</div>
  //     //     <div class="grid gap-1">
  //     //   `

  //     // for (const param of params) {
  //     //   const value = `<div class="text-md text-right font-secondary text-1">${getLocalAmount(param.value)}</div>`
  //     //   content = content + value
  //     // }
}))

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
    class="h-96 px-2"
    @click="onClickChart"
  >
    <VChart
      ref="chartRef"
      :option
      autoresize
    />
  </div>
</template>
