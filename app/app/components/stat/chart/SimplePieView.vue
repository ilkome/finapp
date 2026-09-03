<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { SimplePieDatum } from '~/components/stat/chart/simplePie'
import type { ChartSeries } from '~/components/stat/types'

import { buildSimplePieData } from '~/components/stat/chart/simplePie'

type PieTooltipParam = {
  color: string
  data: SimplePieDatum & { icon?: string }
  name: string
  percent: number
  value: number
}

const {
  endValue,
  isDonut = true,
  isShowLabels = true,
  isShowPercent = false,
  series,
  startValue,
  xAxisLabels,
} = defineProps<{
  endValue?: number
  isDonut?: boolean
  isShowLabels?: boolean
  isShowPercent?: boolean
  series: ChartSeries[]
  startValue?: number
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  select: []
}>()

use([PieChart, SVGRenderer, TooltipComponent])

const { t } = useI18n()
const { width: viewportWidth } = useWindowSize()
const chartRef = ref<HTMLElement>()
const chartSize = useElementSize(chartRef)
const otherLabel = computed(() => t('stat.config.chart.other'))

type PieLabel = {
  color?: string
  icon: string
  label: string
  maxWidth: number
  side: 'left' | 'right'
  x: number
  y: number
}

type PieLabelCandidate = PieLabel & {
  desiredY: number
  index: number
}

type PiePercentLabel = {
  label: string
  x: number
  y: number
}

const PIE_LABEL_HALF_HEIGHT = 10
const PIE_LABEL_VERTICAL_GAP = 24

function distributePieLabels(labels: PieLabelCandidate[], chartHeight: number) {
  const minY = PIE_LABEL_HALF_HEIGHT
  const maxY = chartHeight - PIE_LABEL_HALF_HEIGHT

  for (const side of ['left', 'right'] as const) {
    const sideLabels = labels
      .filter(label => label.side === side)
      .sort((first, second) => first.desiredY - second.desiredY)

    if (sideLabels.length === 0)
      continue

    const gap = sideLabels.length > 1
      ? Math.min(PIE_LABEL_VERTICAL_GAP, (maxY - minY) / (sideLabels.length - 1))
      : PIE_LABEL_VERTICAL_GAP

    sideLabels[0]!.y = Math.max(minY, sideLabels[0]!.desiredY)
    for (let index = 1; index < sideLabels.length; index++) {
      const previous = sideLabels[index - 1]!
      const current = sideLabels[index]!
      current.y = Math.max(current.desiredY, previous.y + gap)
    }

    const last = sideLabels.at(-1)!
    if (last.y <= maxY)
      continue

    last.y = maxY
    for (let index = sideLabels.length - 2; index >= 0; index--) {
      const current = sideLabels[index]!
      const next = sideLabels[index + 1]!
      current.y = Math.min(current.y, next.y - gap)
    }
  }

  return labels.sort((first, second) => first.index - second.index)
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
  if (!isShowLabels || !hasData.value || !chartSize.width.value || !chartSize.height.value)
    return []

  const total = pieData.value.reduce((sum, item) => sum + item.value, 0)
  if (total <= 0)
    return []

  const radius = Math.min(chartSize.width.value, chartSize.height.value) * 0.48
  const markerRadius = radius + 14
  const centerX = chartSize.width.value / 2
  const centerY = chartSize.height.value / 2
  let startAngle = -Math.PI / 2

  const labels = pieData.value.map<PieLabelCandidate>((item, index) => {
    const angle = (item.value / total) * Math.PI * 2
    const middleAngle = startAngle + angle / 2
    startAngle += angle
    const side = Math.cos(middleAngle) < 0 ? 'left' : 'right'
    const x = centerX + (side === 'left' ? -1 : 1) * (radius + 10)

    return {
      color: item.color,
      desiredY: centerY + Math.sin(middleAngle) * markerRadius,
      icon: item.icon ?? 'lucide:folder',
      index,
      label: item.name,
      maxWidth: Math.max(32, side === 'left' ? x - 4 : chartSize.width.value - x - 4),
      side,
      x,
      y: 0,
    }
  })

  return distributePieLabels(labels, chartSize.height.value)
})
const piePercentLabels = computed<PiePercentLabel[]>(() => {
  if (!isShowPercent || !hasData.value || !chartSize.width.value || !chartSize.height.value)
    return []

  const total = pieData.value.reduce((sum, item) => sum + item.value, 0)
  if (total <= 0)
    return []

  const halfSize = Math.min(chartSize.width.value, chartSize.height.value) / 2
  const outerRadius = halfSize * 0.94
  const innerRadius = isDonut ? halfSize * 0.54 : 0
  const labelRadius = isDonut ? (innerRadius + outerRadius) / 2 : outerRadius * 0.62
  const centerX = chartSize.width.value / 2
  const centerY = chartSize.height.value / 2
  let startAngle = -Math.PI / 2

  return pieData.value.flatMap((item) => {
    const angle = (item.value / total) * Math.PI * 2
    const middleAngle = startAngle + angle / 2
    startAngle += angle
    if (angle < Math.PI / 18)
      return []
    return [{
      label: `${Math.round(item.value / total * 100)}%`,
      x: centerX + Math.cos(middleAngle) * labelRadius,
      y: centerY + Math.sin(middleAngle) * labelRadius,
    }]
  })
})
const option = computed(() => ({
  animation: true,
  animationDuration: 0,
  animationDurationUpdate: 0,
  series: [{
    avoidLabelOverlap: false,
    center: ['50%', '50%'],
    cursor: 'default',
    data: pieData.value.map(item => ({
      emphasis: {
        disabled: item.name === otherLabel.value,
      },
      icon: item.icon,
      itemStyle: { color: item.color },
      name: item.name,
      signedValue: item.signedValue,
      value: item.value,
      valueType: item.valueType,
    })),
    emphasis: {
      itemStyle: {
        shadowBlur: 0,
        shadowColor: 'transparent',
        shadowOffsetX: 0,
      },
      scale: true,
      scaleSize: 6,
    },
    itemStyle: {
      borderColor: 'var(--ui-bg)',
      borderRadius: 3,
      borderWidth: 2,
    },
    label: { show: false },
    labelLine: { show: false },
    radius: [isDonut ? '54%' : '0%', '94%'],
    type: 'pie',
  }],
  stateAnimation: {
    duration: 180,
    easing: 'cubicOut' as const,
  },
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

function pieTooltipRows(param: PieTooltipParam) {
  return [{
    amount: param.data.signedValue ?? param.value,
    color: param.color,
    description: `${param.percent}%`,
    icon: param.data.icon,
    key: param.name,
    name: param.name,
    value: param.value,
  }]
}
</script>

<template>
  <div
    v-if="hasData"
    ref="chartRef"
    class="relative h-40 max-w-full min-w-0 cursor-default overflow-visible **:cursor-default! @3xl/stat:h-52"
    role="img"
    :aria-label="chartAriaLabel"
    @click="emit('select')"
  >
    <VChart :option :updateOptions="{ notMerge: true }" autoresize style="overflow: visible">
      <template #tooltip="params">
        <StatChartAxisTooltip :rows="pieTooltipRows(params as PieTooltipParam)" />
      </template>
    </VChart>

    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div
        v-for="(item, index) in piePercentLabels"
        :key="`percent-${index}`"
        data-pie-percent
        class="absolute -translate-1/2 text-[10px] leading-none text-white"
        :style="{ left: `${item.x}px`, top: `${item.y}px` }"
      >
        {{ item.label }}
      </div>
      <div
        v-for="(item, index) in pieLabels"
        :key="`${item.label}-${index}`"
        data-pie-label
        class="absolute flex -translate-y-1/2 items-center gap-2 overflow-hidden rounded-sm bg-default/85 px-1.5 py-0.5 text-xs whitespace-nowrap text-highlighted"
        :class="item.side === 'left' ? '-translate-x-full' : ''"
        :style="{ left: `${item.x}px`, maxWidth: `${item.maxWidth}px`, top: `${item.y}px` }"
      >
        <span class="shrink-0" aria-hidden="true">
          <Icon :name="item.icon" :style="{ color: item.color ?? 'var(--ui-text-highlighted)' }" size="12" />
        </span>
        <span class="truncate">{{ item.label }}</span>
      </div>
    </div>
  </div>

  <div v-else class="flex h-40 items-center justify-center text-sm text-muted @3xl/stat:h-52">
    {{ t('chart.empty') }}
  </div>
</template>
