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
import { markArea, setChartXAxis } from '~/components/stat/chart/utils'
import type { PeriodProvider } from '~/components/dashboard/Page.vue'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = withDefaults(
  defineProps<{
    chartType?: 'bar' | 'line'
    isShowIncome?: boolean
    isShowExpense?: boolean
  }>(),
  {
    chartType: 'line',
    isShowIncome: true,
    isShowExpense: true,
  },
)
const trnFormStore = useTrnFormStore()
const period = inject('period') as PeriodProvider
const statData = inject('statData') as ComputedRef<{
  categories: any[]
  series: any[]
}>

const chartRef = ref()

const chartType = computed(
  () => period.periods.value[period.nameWithoutAll.value].type,
)

const markedArea = computed(() =>
  statData.value.categories.find((i: number) => +i === +period.date.value),
)

function getFormat() {
  switch (period.nameWithoutAll.value) {
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
  if (chartType.value !== 'bar') {
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
  period.setDate(statData.value.categories[index])
  if (period.nameWithoutAll.value === 'day')
    trnFormStore.values.date = dayjs(statData.value.categories[index]).startOf(period.nameWithoutAll.value).valueOf()
}

function setChartSeries(series: unknown[]) {
  return series
    .filter(
      (v, index) =>
        (index === 0 && props.isShowExpense)
        || (index === 1 && props.isShowIncome),
    )
    .map((item: any) => ({
      ...defu(lineConfig, item),
      type: chartType.value,
      label: {
        ...lineConfig.label,
        show: period.ui.value.isShowDataLabels,
      },
    }))
}

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
</script>

<template>
  <div class="_rounded-lg _bg-item-4 relative">
    <!-- <pre>11 {{ markedArea }}</pre>
    <pre>{{ statData.categories }}</pre>
    <pre>{{ period.date.value }}</pre> -->
    <!-- <pre>{{ statData.series }}</pre> -->
    <!-- <pre @click="period.setNextPeriodDate()">{{ period }}</pre>
    <pre @click="period.setPrevPeriodDate()">{{ period }}</pre> -->
    <div class="bg-surface-4 h-48">
      <VChart
        ref="chartRef"
        :option="getChartData()"
        autoresize
        @zr:click="onClickChart"
      />
    </div>
  </div>
</template>
