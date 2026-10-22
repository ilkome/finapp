<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { SimplePieDatum } from '~/components/stat/chart/simplePie'
import type { ChartSeries } from '~/components/stat/types'

import { resolveChartCss } from '~/components/stat/chart/cssValues'
import { buildSimplePieData, resolvePieWindow } from '~/components/stat/chart/simplePie'

type PieTooltipParam = {
  color: string
  data: SimplePieDatum & { icon?: string }
  name: string
  percent: number
  value: number
}

const {
  centerLabel,
  endValue,
  isAllSlices = false,
  isDonut = true,
  isRoundIcon = false,
  isShowLabels = true,
  isShowPercent = false,
  isStaticOnMount = false,
  labelMinShare,
  series,
  startValue,
  xAxisLabels,
} = defineProps<{
  /** Text in the donut hole, e.g. the formatted total. */
  centerLabel?: string
  endValue?: number
  /** Every slice drawn, none folded into "other". */
  isAllSlices?: boolean
  isDonut?: boolean
  isRoundIcon?: boolean
  isShowLabels?: boolean
  isShowPercent?: boolean
  /** The first render does not animate (a chart opened in a sheet); later data changes do. */
  isStaticOnMount?: boolean
  /** Only slices at least this share of the total get a label, and a side whose labels would overlap gets none. */
  labelMinShare?: number
  series: ChartSeries[]
  startValue?: number
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  select: []
  /** A slice was tapped, by its name. */
  selectSlice: [name: string]
}>()

use([PieChart, CanvasRenderer, TooltipComponent])

const { t } = useI18n()
const { width: viewportWidth } = useWindowSize()
const chartRef = ref<HTMLElement>()
const chartSize = useElementSize(chartRef)
const otherLabel = computed(() => t('stat.config.chart.other'))

type PieLabel = {
  color?: string
  icon?: string
  label: string
  /** 2 when the name wraps; a side with no room for that keeps every name on one line, cut. */
  lines: number
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
/** Distance between the centers of two one-line labels; a two-line label adds half of it on each side. */
const PIE_LABEL_VERTICAL_GAP = 24
/** Label padding, marker and gap around the text, in px. */
const PIE_LABEL_CHROME = 26

let measureContext: CanvasRenderingContext2D | null | undefined
/** 2 when the name needs the label's second line at this width. */
function labelLines(label: string, maxWidth: number, font: string) {
  measureContext ??= document.createElement('canvas').getContext('2d')
  if (!measureContext)
    return 1
  measureContext.font = font
  return measureContext.measureText(label).width > maxWidth - PIE_LABEL_CHROME ? 2 : 1
}

function distributePieLabels(labels: PieLabelCandidate[], chartHeight: number) {
  const minY = PIE_LABEL_HALF_HEIGHT
  const maxY = chartHeight - PIE_LABEL_HALF_HEIGHT

  for (const side of ['left', 'right'] as const) {
    const sideLabels = labels
      .filter(label => label.side === side)
      .sort((first, second) => first.desiredY - second.desiredY)

    if (sideLabels.length === 0)
      continue

    const gapsOf = () => sideLabels.map((label, index) => index === 0 ? 0 : PIE_LABEL_VERTICAL_GAP / 2 * (sideLabels[index - 1]!.lines + label.lines))
    let gaps = gapsOf()
    let totalGap = gaps.reduce((sum, gap) => sum + gap, 0)
    if (totalGap > maxY - minY && sideLabels.some(label => label.lines > 1)) {
      sideLabels.forEach(label => label.lines = 1)
      gaps = gapsOf()
      totalGap = gaps.reduce((sum, gap) => sum + gap, 0)
    }
    const scale = totalGap > maxY - minY ? (maxY - minY) / totalGap : 1

    sideLabels[0]!.y = Math.max(minY, sideLabels[0]!.desiredY)
    for (let index = 1; index < sideLabels.length; index++) {
      const previous = sideLabels[index - 1]!
      const current = sideLabels[index]!
      current.y = Math.max(current.desiredY, previous.y + gaps[index]! * scale)
    }

    const last = sideLabels.at(-1)!
    if (last.y <= maxY)
      continue

    last.y = maxY
    for (let index = sideLabels.length - 2; index >= 0; index--) {
      const current = sideLabels[index]!
      const next = sideLabels[index + 1]!
      current.y = Math.min(current.y, next.y - gaps[index + 1]! * scale)
    }
  }

  return labels.sort((first, second) => first.index - second.index)
}

const pieData = computed(() => {
  const { endIndex, startIndex } = resolvePieWindow(xAxisLabels, startValue, endValue)
  return buildSimplePieData(series, startIndex, endIndex, otherLabel.value, isAllSlices ? Number.POSITIVE_INFINITY : undefined)
})
const isAnimated = ref(!isStaticOnMount)
watch(pieData, () => isAnimated.value = true)
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
  const font = `12px ${getComputedStyle(chartRef.value!).fontFamily}`

  const candidates = pieData.value.map<PieLabelCandidate>((item, index) => {
    const angle = (item.value / total) * Math.PI * 2
    const middleAngle = startAngle + angle / 2
    startAngle += angle
    const side = Math.cos(middleAngle) < 0 ? 'left' : 'right'
    const x = centerX + (side === 'left' ? -1 : 1) * (radius + 10)
    const maxWidth = Math.max(32, side === 'left' ? x - 4 : chartSize.width.value - x - 4)

    return {
      color: item.color,
      desiredY: centerY + Math.sin(middleAngle) * markerRadius,
      icon: item.icon,
      index,
      label: item.name,
      lines: labelLines(item.name, maxWidth, font),
      maxWidth,
      side,
      x,
      y: 0,
    }
  })
  const labels = labelMinShare === undefined ? candidates : candidates.filter(label => pieData.value[label.index]!.value / total >= labelMinShare)
  const fits = (side: PieLabel['side']) => (labels.filter(label => label.side === side).length - 1) * PIE_LABEL_VERTICAL_GAP <= chartSize.height.value - PIE_LABEL_HALF_HEIGHT * 2
  const shown = labelMinShare === undefined ? labels : labels.filter(label => fits(label.side))

  return distributePieLabels(shown, chartSize.height.value)
})
// The donut's inner radius is the series' inner `radius` of half the smaller side, less a margin.
const holeWidth = computed(() => Math.min(chartSize.width.value, chartSize.height.value) * 0.54 * 0.9)
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
const option = computed(() => resolveChartCss({
  animation: isAnimated.value,
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
    <VChart
      :option
      :updateOptions="{ notMerge: true }"
      autoresize
      style="overflow: visible"
      @click="(params: { name?: string }) => params.name && emit('selectSlice', params.name)"
    >
      <template #tooltip="params">
        <StatChartAxisTooltip :isRoundIcon :rows="pieTooltipRows(params as PieTooltipParam)" />
      </template>
    </VChart>

    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div
        v-if="centerLabel && isDonut"
        class="absolute inset-0 flex items-center justify-center text-center font-secondary text-sm leading-tight whitespace-pre-line text-highlighted"
        data-pie-center
      >
        <span class="line-clamp-3" :style="{ maxWidth: `${holeWidth}px` }">{{ centerLabel }}</span>
      </div>
      <div
        v-for="(item, index) in piePercentLabels"
        :key="`percent-${index}`"
        data-pie-percent
        class="absolute -translate-1/2 text-2xs leading-none text-white"
        :style="{ left: `${item.x}px`, top: `${item.y}px` }"
      >
        {{ item.label }}
      </div>
      <div
        v-for="(item, index) in pieLabels"
        :key="`${item.label}-${index}`"
        data-pie-label
        class="absolute flex -translate-y-1/2 items-center gap-2 overflow-hidden rounded-sm bg-default/85 px-1.5 py-0.5 text-xs text-highlighted"
        :class="item.side === 'left' ? '-translate-x-full' : ''"
        :style="{ left: `${item.x}px`, maxWidth: `${item.maxWidth}px`, top: `${item.y}px` }"
      >
        <span v-if="item.icon" class="shrink-0" aria-hidden="true">
          <Icon :name="item.icon" :style="{ color: item.color ?? 'var(--ui-text-highlighted)' }" size="12" />
        </span>
        <span v-else class="size-2 shrink-0 rounded-full" :style="{ background: item.color ?? 'var(--ui-text-highlighted)' }" aria-hidden="true" />
        <span class="min-w-0 leading-tight" :class="item.lines > 1 ? 'line-clamp-2' : 'truncate'">{{ item.label }}</span>
      </div>
    </div>
  </div>

  <div v-else class="flex h-40 items-center justify-center text-sm text-muted @3xl/stat:h-52">
    {{ t('chart.empty') }}
  </div>
</template>
