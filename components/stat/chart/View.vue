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
import type { StatProvider } from '~/components/stat/useStat'
import { config, lineConfig } from '~/components/stat/chart/config'
import { markArea, setChartXAxis } from '~/components/stat/chart/utils'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import type { FilterProvider } from '~/components/filter/useFilter'

const props = withDefaults(
  defineProps<{
    chartType?: 'bar' | 'line'
    isShowIncome?: boolean
    isShowExpense?: boolean
    isShowSummary?: boolean
  }>(),
  {
    chartType: 'line',
    isShowIncome: true,
    isShowExpense: true,
  },
)

const filter = inject('filter') as FilterProvider
const stat = inject('stat') as StatProvider

const trnFormStore = useTrnFormStore()
const chartRef = ref()

const chartType = computed(
  () => filter.periods.value[filter.nameWithoutAll.value].type,
)

const markedArea = computed(() =>
  stat.chartCategories.value.find((i: number) => +i === +filter.date.value),
)

function getFormat() {
  switch (filter.nameWithoutAll.value) {
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
    xAxis: setChartXAxis(stat.chartCategories.value),
    series: setChartSeries(stat.chartSeries.value),
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
  filter.setDate(stat.chartCategories.value[index])
  if (filter.nameWithoutAll.value === 'day')
    trnFormStore.values.date = dayjs(stat.chartCategories.value[index]).startOf(filter.nameWithoutAll.value).valueOf()
}

function setChartSeries(series: unknown[]) {
  return series
    .filter(
      (v, index) =>
        (index === 0 && props.isShowExpense)
        || (index === 1 && props.isShowIncome) || (index === 2 && props.isShowSummary),
    )
    .map((item: any) => ({
      ...defu(lineConfig, item),
      type: chartType.value,
      label: {
        ...lineConfig.label,
        show: filter.ui.value.isShowDataLabels,
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
  <div class="bg-surface-4 h-48">
    <VChart
      ref="chartRef"
      :option="getChartData()"
      autoresize
      @zr:click="onClickChart"
    />
  </div>
</template>
