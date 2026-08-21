<script setup lang="ts">
import { PieChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { CategoryPieDatum } from '~/components/stat/chart/categoryBreakdown'

import { formatChartAmount } from '~/components/stat/chart/format'

const { pieData, typeLabel } = defineProps<{
  pieData: CategoryPieDatum[]
  typeLabel: string
}>()

use([
  PieChart,
  SVGRenderer,
])

const { locale } = useI18n()
// Avoid entrance animation while enabling transitions for subsequent data updates.
const isInitialRender = ref(true)
const total = computed(() => pieData.reduce((acc, item) => acc + item.value, 0))
const hasData = computed(() => total.value > 0)
const option = computed(() => ({
  animation: !isInitialRender.value,
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
  <div v-if="hasData" class="size-12 shrink-0" role="img" :aria-label="`${typeLabel}: ${formatChartAmount(total, locale)}`">
    <VChart :option :updateOptions="{ notMerge: true }" autoresize />
  </div>
</template>
