<script setup lang="ts">
import { PieChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { CategoryPieDatum } from '~/components/stat/chart/categoryBreakdown'

import { resolveChartCss } from '~/components/stat/chart/cssValues'
import { formatChartAmount } from '~/components/stat/chart/format'

const { isStatic = false, pieData, sizeClass = 'size-12', typeLabel } = defineProps<{
  /** No entrance and no update animation. */
  isStatic?: boolean
  pieData: CategoryPieDatum[]
  sizeClass?: string
  typeLabel: string
}>()

use([
  PieChart,
  CanvasRenderer,
])

// Avoid entrance animation while enabling transitions for subsequent data updates.
const isInitialRender = ref(true)
const total = computed(() => pieData.reduce((acc, item) => acc + item.value, 0))
const hasData = computed(() => total.value > 0)
const option = computed(() => resolveChartCss({
  animation: !isStatic && !isInitialRender.value,
  animationDurationUpdate: 300,
  series: [{
    data: pieData.map(item => ({ itemStyle: { color: item.color }, value: item.value })),
    emphasis: { disabled: true },
    itemStyle: { borderColor: 'var(--ui-bg)', borderWidth: 1 },
    label: { show: false },
    labelLine: { show: false },
    radius: ['42%', '92%'],
    silent: true,
    type: 'pie',
  }],
}))

onMounted(() => {
  isInitialRender.value = false
})
</script>

<template>
  <div v-if="hasData" :class="sizeClass" class="shrink-0 cursor-default **:cursor-default!" role="img" :aria-label="`${typeLabel}: ${formatChartAmount(total)}`">
    <VChart :option :updateOptions="{ notMerge: true }" autoresize />
  </div>
</template>
