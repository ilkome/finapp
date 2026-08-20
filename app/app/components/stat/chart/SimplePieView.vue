<script setup lang="ts">
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import { useElementSize } from '@vueuse/core'
import type { SimplePieDatum } from '~/components/stat/chart/simplePie'
import type { ChartSeries } from '~/components/stat/types'

import { formatChartAmount } from '~/components/stat/chart/format'
import { buildSimplePieData } from '~/components/stat/chart/simplePie'

type PieTooltipParam = {
  color: string
  data: SimplePieDatum
  name: string
  percent: number
  value: number
}

const {
  endValue,
  series,
  startValue,
  xAxisLabels,
} = defineProps<{
  endValue?: number
  series: ChartSeries[]
  startValue?: number
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  select: []
}>()

use([PieChart, SVGRenderer, TooltipComponent])

const { locale, t } = useI18n()
const { width: viewportWidth } = useWindowSize()
const chartRef = ref<HTMLElement>()
const chartSize = useElementSize(chartRef)
const otherLabel = computed(() => t('stat.config.chart.other'))

type PieLabel = {
  icon: string
  color?: string
  label: string
  x: number
  y: number
}

const pieData = computed(() => {
  const startIndex = xAxisLabels.indexOf(startValue ?? -1)
  const endIndex = xAxisLabels.indexOf(endValue ?? -1)
  return buildSimplePieData(
    series,
    startIndex >= 0 ? startIndex : 0,
    endIndex >= startIndex ? endIndex : Number.POSITIVE_INFINITY,
    otherLabel.value,
  )
})
const hasData = computed(() => pieData.value.length > 0)
const chartAriaLabel = computed(() => {
  const names = pieData.value.map(item => item.name).join(', ')
  return names ? `${t('chart.label')}: ${names}` : t('chart.label')
})
const pieLabels = computed<PieLabel[]>(() => {
  if (!hasData.value || !chartSize.width.value || !chartSize.height.value)
    return []

  const total = pieData.value.reduce((sum, item) => sum + item.value, 0)
  if (total <= 0)
    return []

  const radius = Math.min(chartSize.width.value, chartSize.height.value) * 0.48
  const markerRadius = radius * 0.94 + 6
  const centerX = chartSize.width.value / 2
  const centerY = chartSize.height.value / 2
  let startAngle = -Math.PI / 2

  return pieData.value.map((item) => {
    const angle = (item.value / total) * Math.PI * 2
    const middleAngle = startAngle + angle / 2
    startAngle += angle

    return {
      icon: item.icon ?? 'lucide:folder',
      color: item.color,
      label: item.name,
      x: centerX + Math.cos(middleAngle) * markerRadius,
      y: centerY + Math.sin(middleAngle) * markerRadius,
    }
  })
})
const option = computed(() => ({
  animation: false,
  series: [{
    cursor: 'default',
    avoidLabelOverlap: false,
    center: ['50%', '50%'],
    hoverAnimation: false,
    hoverOffset: 0,
    data: pieData.value.map(item => ({
      emphasis: {
        disabled: item.name === otherLabel.value,
      },
      itemStyle: { color: item.color },
      name: item.name,
      signedValue: item.signedValue,
      value: item.value,
      valueType: item.valueType,
    })),
    emphasis: {
      scale: false,
      itemStyle: {
        shadowBlur: 0,
        shadowColor: 'transparent',
        shadowOffsetX: 0,
      },
    },
    itemStyle: {
      borderColor: 'var(--ui-bg)',
      borderRadius: 3,
      borderWidth: 2,
    },
    label: { show: false },
    labelLine: { show: false },
    radius: ['54%', '94%'],
    type: 'pie',
  }],
  tooltip: {
    appendToBody: true,
    backgroundColor: 'transparent',
    borderWidth: 0,
    confine: false,
    padding: 0,
    show: viewportWidth.value >= 500,
    trigger: 'item',
  },
}))
</script>


<template>
  <div
    v-if="hasData"
    ref="chartRef"
    class="relative h-40 max-w-full min-w-0 overflow-visible @3xl/stat:h-52"
    role="img"
    :aria-label="chartAriaLabel"
    @click="emit('select')"
  >
    <VChart :option :updateOptions="{ notMerge: true }" autoresize style="overflow: visible">
      <template #tooltip="params">
        <div class="rounded-md bg-elevated px-3 py-2">
          <div class="flex items-center gap-2">
            <div class="size-2.5 rounded-full" :style="`background: ${(params as PieTooltipParam).color}`" />
            <div class="text-sm text-muted">
              {{ (params as PieTooltipParam).name }}
            </div>
            <div v-if="(params as PieTooltipParam).data.valueType" class="text-xs text-muted">
              {{ t(`money.${(params as PieTooltipParam).data.valueType}`) }}
            </div>
          </div>
          <div class="flex items-baseline justify-between gap-4 pt-1">
            <div class="font-secondary text-lg text-highlighted">
              {{ formatChartAmount((params as PieTooltipParam).data.signedValue ?? (params as PieTooltipParam).value, locale) }}
            </div>
            <div class="text-xs text-muted">
              {{ (params as PieTooltipParam).percent }}%
            </div>
          </div>
        </div>
      </template>
    </VChart>

    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div
        v-for="(item, index) in pieLabels"
        :key="`${item.label}-${index}`"
        class="absolute -translate-y-1/2 -translate-x-1/2 flex items-center gap-2 rounded-sm bg-default/85 px-1.5 py-0.5 text-xs text-white"
        :style="{ left: `${item.x}px`, top: `${item.y}px` }"
      >
        <span class="shrink-0" aria-hidden="true">
          <Icon :name="item.icon" :style="{ color: item.color ?? 'var(--ui-text-highlighted)' }" size="12" />
        </span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>

  <div v-else class="flex h-40 items-center justify-center text-sm text-muted @3xl/stat:h-52">
    {{ t('chart.empty') }}
  </div>
</template>
