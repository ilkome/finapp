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
import { config, lineConfig } from '~/components/stat/chart/config'
import { markArea, setChartXAxis } from '~/components/stat/chart/utils'
import type { PeriodNameWithAll } from '~/components/filter/useFilter'
import { getFormatForChart } from '~/components/date/format'
import type { ChartType } from '~/components/chart/types'

const props = withDefaults(
  defineProps<{
    categories: unknown
    chartType?: ChartType
    config?: object
    isShowDataLabels?: boolean
    isShowExpense?: boolean
    isShowIncome?: boolean
    isShowSummary?: boolean
    markedArea?: unknown
    periodName: PeriodNameWithAll
    series: unknown[]
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

const chartRef = ref()

const baseConfig = computed(() => {
  const data = defu(config, {
    series: setChartSeries(props.series),
    xAxis: setChartXAxis(props.categories),
    ...props.config,
  })

  data.xAxis.axisLabel.formatter = (date: string) => {
    return dayjs(+date).format(getFormatForChart(props.periodName))
  }
  data.xAxis.axisPointer.label.formatter = ({ value } = { value: string }) => {
    return dayjs(+value).format(getFormatForChart(props.periodName))
  }

  return data
})

const chartOption = computed(() => {
  const data = { ...baseConfig.value }

  // INFO: Marked area works only with bar chart
  if (props.markedArea) {
    if (props.chartType !== 'bar') {
      data.series.push({
        data: [],
        markArea: markArea(props.markedArea),
        type: 'bar',
      })
    }
    else {
      data.series[0].markArea = markArea(props.markedArea)
    }
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
      type: item.type || props.chartType,
    }))
}
</script>

<template>
  <div class="bg-surface-4 h-48">
    <VChart
      ref="chartRef"
      :option="chartOption"
      autoresize
      @zr:click="onClickChart"
    />
  </div>
</template>
