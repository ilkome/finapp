<script setup lang="ts">
import dayjs from 'dayjs'
import defu from 'defu'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
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
import type { PeriodNameWithoutAll } from '~/components/filter/useFilter'
import { getFormatForChart } from '~/components/date/format'
import type { ChartType } from '~/components/chart/types'

const props = withDefaults(
  defineProps<{
    categories: unknown
    series: unknown[]
    chartType?: ChartType
    isShowIncome?: boolean
    isShowExpense?: boolean
    isShowSummary?: boolean
    markedArea?: unknown
    periodName: PeriodNameWithoutAll
    isShowDataLabels?: boolean
  }>(),
  {
    chartType: 'line',
    isShowIncome: true,
    isShowExpense: true,
  },
)

const emit = defineEmits<{
  click: [idx: number]
}>()

use([
  BarChart,
  GridComponent,
  LineChart,
  SVGRenderer,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
  PieChart,
])

const chartRef = ref()

function getChartData() {
  const data = defu(config, {
    xAxis: setChartXAxis(props.categories),
    series: setChartSeries(props.series),
  })

  data.xAxis.axisLabel.formatter = (date: string) => {
    return dayjs(+date).format(getFormatForChart(props.periodName))
  }
  data.xAxis.axisPointer.label.formatter = ({ value } = { value: string }) => {
    return dayjs(+value).format(getFormatForChart(props.periodName))
  }

  // INFO: Marked area works only with bar chart
  if (props.markedArea) {
    if (props.chartType !== 'bar') {
      data.series.push({
        data: [],
        type: 'bar',
        markArea: markArea(props.markedArea),
      })
    }
    else {
      data.series[0].markArea = markArea(props.markedArea)
    }
  }

  return data
}

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
      type: item.type || props.chartType,
      label: {
        ...lineConfig.label,
        show: props.isShowDataLabels,
      },
    }))
}
</script>

<template>
  <div class="bg-surface-4 h-48">
    <VChart
      ref="chartRef"
      :option="getChartData()"
      autoresize
      @zr:click="onClickChart"
    />
  </div>
</template>
