<script setup lang="ts">
import dayjs from 'dayjs'
import defu from 'defu'
import { BarChart, LineChart } from 'echarts/charts'
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
import { useChartStore } from '~/components/stat/chart/useChartStore'
import { markArea, setChartXAxis } from '~/components/stat/chart/utils'
import type { TrnId } from '~/components/trns/types'
import type { PeriodName } from '~/components/stat/chart/useChartStore'

const props = withDefaults(
  defineProps<{
    trnsIds: TrnId[]
    chartType?: 'bar' | 'line'
  }>(),
  {
    chartType: 'line',
    trnsIds: () => [],
  },
)

const periodWithoutAll = inject('periodWithoutAll') as ComputedRef<PeriodName>
const date = inject('date') as ComputedRef<number>
const setDate = inject('setDate') as (date: number) => void
const statData = inject('statData') as ComputedRef<unknown>

use([
  BarChart,
  GridComponent,
  LineChart,
  SVGRenderer,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
])

const chartStore = useChartStore()

const chartRef = ref()

const markedArea = computed(() =>
  statData.value.categories.find(i => +i === +date.value),
)

function getFormat() {
  switch (periodWithoutAll.value) {
    case 'day':
      return 'D.MM'
    case 'week':
      return 'D.MM'
    case 'month':
      return 'MMM'
    case 'year':
      return 'YYYY'
    default:
      return 'MM'
  }
}

function getChartData() {
  const data = defu(config, {
    xAxis: setChartXAxis(statData.value.categories),
    series: setChartSeries(statData.value.series),
  })

  data.xAxis.axisLabel.formatter = (date: string) => {
    return dayjs(+date).format(getFormat())
  }
  data.xAxis.axisPointer.label.formatter = ({ value } = { value: string }) => {
    return dayjs(+value).format(getFormat())
  }

  // INFO: Marked area works only with bar chart
  if (props.chartType !== 'bar') {
    data.series.push({
      data: [],
      type: 'bar',
      markArea: markArea(markedArea.value),
    })
  }
  else {
    data.series[0].markArea = markArea(markedArea.value)
  }

  return data
}

async function onClickChart(params: { offsetX: number, offsetY: number }) {
  const [index] = chartRef.value.convertFromPixel('grid', [
    params.offsetX,
    params.offsetY,
  ])
  setDate(statData.value.categories[index])
}

function setChartSeries(series: unknown[]) {
  return series.map((item: any) => ({
    ...defu(lineConfig, item),
    type: props.chartType,
    label: {
      ...lineConfig.label,
      show: chartStore.isShowDataLabels,
    },
  }))
}
</script>

<template>
  <VChart
    ref="chartRef"
    :option="getChartData()"
    autoresize
    @zr:click="onClickChart"
  />
</template>
