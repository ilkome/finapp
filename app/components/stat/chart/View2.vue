<script setup lang="ts">
import dayjs from 'dayjs'
import defu from 'defu'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { config, lineConfig } from '~/components/stat/chart/config2'
import { setChartXAxis } from '~/components/stat/chart/utils'
import { useDateFormats } from '~/components/date/useDateFormats'
import type { ChartType } from '~/components/stat/chart/types'
import type { Period } from '~/components/date/types'

const props = withDefaults(
  defineProps<{
    chartType: ChartType
    config?: object
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

const { getFormatForChart } = useDateFormats()
const chartRef = ref()

const option = computed(() => {
  const data = defu(config, {
    series: setChartSeries(props.series),
    xAxis: setChartXAxis(props.xAxisLabels),
    ...props.config,
  })

  data.xAxis.axisLabel.formatter = (date: string) => {
    return dayjs(+date).format(getFormatForChart(props.period))
  }
  data.xAxis.axisPointer.label.formatter = ({ value } = { value: string }) => {
    return dayjs(+value).format(getFormatForChart(props.period))
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
