<script setup lang="ts">
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import VChart from 'vue-echarts'

import {
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components'

defineProps<{
  option: object
  loading?: boolean
}>()

const emit = defineEmits(['finished', 'onClickChart'])

use([
  BarChart,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  MarkAreaComponent,
  MarkLineComponent,
  SVGRenderer,
  TooltipComponent,
])

const chart = ref()
function finished() {
  emit('finished', chart.value)
}

function onClickChart(params: any) {
  emit('onClickChart', params)
}
</script>

<template lang="pug">
VChart.w-full(
  :loading="loading"
  :option="option"
  @finished="finished"
  @zr:click="onClickChart"
  autoresize
  ref="chart"
)
</template>
