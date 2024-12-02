<script setup lang="ts">
import VChart from 'vue-echarts'
import defu from 'defu'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { DataZoomComponent, GridComponent, MarkAreaComponent, MarkLineComponent, MarkPointComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
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

const { locale } = useI18n()
const statConfig = inject('statConfig') as StatConfigProvider
const chartRef = ref()

const option = computed(() => {
  const data = defu(config, {
    series: setChartSeries(props.series),
    xAxis: setChartXAxis(props.xAxisLabels),
    ...statConfig.config.value,
    tooltip: {
      ...config.tooltip,
      formatter(params) {
        let content = '<div class="px-1">'
        content = `${content}
          <div class="text-md pb-2 text-2 text-right">${formatByLocale(new Date(+params[0].name), getFormatForChart(props.period), locale.value)}</div>
          <div class="grid gap-1">
        `

        for (const param of params) {
          const value = `<div class="text-md text-right font-secondary text-1">${getLocalAmount(param.value)}</div>`
          content = content + value
        }

        return `${content}</div></div>`
      },
    },
  })

  data.xAxis.axisLabel.formatter = (date: string) => {
    return formatByLocale(new Date(+date), getFormatForChart(props.period), locale.value)
  }
  data.xAxis.axisPointer.label.formatter = ({ value }: { value: string }) => {
    return formatByLocale(new Date(+value), getFormatForChart(props.period), locale.value)
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
    class="h-40 px-2"
    @click="onClickChart"
  >
    <VChart
      ref="chartRef"
      :option
      autoresize
    />
  </div>
</template>
