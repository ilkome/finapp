<script setup lang="ts">
import type { ECElementEvent } from 'echarts/core'

import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { CategoryId } from '~/components/categories/types'
import type { CategoryPieDatum } from '~/components/stat/chart/useCategorySeriesBuilder'

import { OTHER_SLICE_ID } from '~/components/stat/chart/useCategorySeriesBuilder'
import { formatChartAmount } from '~/components/stat/chart/utils'

type PieTooltipParam = {
  color: string
  name: string
  percent: number
  value: number
}

type PieClickParam = {
  data?: { id?: CategoryId, isOther?: boolean }
}

const { pieData, showLegend = true, typeLabel } = defineProps<{
  pieData: CategoryPieDatum[]
  showLegend?: boolean
  typeLabel: string
}>()

const emit = defineEmits<{
  clickCategory: [id: CategoryId]
}>()

use([
  PieChart,
  SVGRenderer,
  TooltipComponent,
])

const { locale, t } = useI18n()

const total = computed(() => pieData.reduce((acc, item) => acc + item.value, 0))
const hasData = computed(() => pieData.length > 0 && total.value > 0)

const option = computed(() => ({
  series: [{
    avoidLabelOverlap: false,
    center: ['50%', '50%'],
    data: pieData.map(item => ({
      cursor: item.isOther ? 'default' : 'pointer',
      id: item.id,
      isOther: item.isOther ?? false,
      itemStyle: { color: item.color },
      name: item.name,
      value: item.value,
    })),
    emphasis: { focus: 'self' },
    itemStyle: {
      borderColor: 'var(--ui-bg)',
      borderWidth: 2,
    },
    label: { show: false },
    labelLine: { show: false },
    minAngle: 3,
    radius: ['55%', '80%'],
    type: 'pie',
  }],
  tooltip: {
    // Donut lives in a narrow container; append to body and don't confine so
    // tooltips for left-side slices aren't clipped by the chart bounds.
    appendToBody: true,
    backgroundColor: 'transparent',
    borderWidth: 0,
    confine: false,
    padding: 0,
    trigger: 'item',
  },
}))

function percentOf(value: number) {
  return total.value > 0 ? Math.round((value / total.value) * 100) : 0
}

function onClickSlice(params: ECElementEvent) {
  const data = params?.data as PieClickParam['data']
  if (!data?.id || data.isOther || data.id === OTHER_SLICE_ID)
    return
  emit('clickCategory', data.id)
}
</script>

<template>
  <div
    v-if="hasData"
    class="flex items-center justify-center gap-4"
    :class="{ '@3xl/stat:justify-start': showLegend }"
  >
    <div class="relative size-40 shrink-0 @3xl/stat:size-52">
      <VChart
        :option
        :updateOptions="{ notMerge: true }"
        autoresize
        @click="onClickSlice"
      >
        <template #tooltip="params">
          <div class="bg-elevated rounded-md px-3 py-2">
            <div class="flex items-center gap-2">
              <div class="size-2.5 rounded-full" :style="`background: ${(params as PieTooltipParam).color}`" />
              <div class="text-muted text-sm">
                {{ (params as PieTooltipParam).name }}
              </div>
            </div>

            <div class="flex items-baseline justify-between gap-4 pt-1">
              <div class="font-secondary text-highlighted text-lg">
                {{ formatChartAmount((params as PieTooltipParam).value, locale) }}
              </div>
              <div class="text-muted text-xs">
                {{ (params as PieTooltipParam).percent }}%
              </div>
            </div>
          </div>
        </template>
      </VChart>

      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div class="font-secondary text-highlighted text-lg leading-tight">
          {{ formatChartAmount(total, locale) }}
        </div>
        <div class="text-2xs text-muted">
          {{ typeLabel }}
        </div>
      </div>
    </div>

    <div
      v-if="showLegend"
      class="hidden min-w-0 grow content-start gap-0.5 @3xl/stat:grid"
    >
      <button
        v-for="item in pieData"
        :key="item.id"
        type="button"
        class="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-left"
        :class="item.isOther ? 'cursor-default' : 'hover:bg-elevated'"
        @click="item.isOther ? undefined : emit('clickCategory', item.id)"
      >
        <div class="flex min-w-0 items-center gap-2">
          <div class="size-2.5 shrink-0 rounded-full" :style="`background: ${item.color}`" />
          <div class="text-muted truncate text-sm">
            {{ item.name }}
          </div>
        </div>

        <div class="flex shrink-0 items-baseline gap-2">
          <div class="font-secondary text-highlighted text-sm">
            {{ formatChartAmount(item.value, locale) }}
          </div>
          <div class="text-2xs text-dimmed w-8 text-right">
            {{ percentOf(item.value) }}%
          </div>
        </div>
      </button>
    </div>
  </div>

  <div
    v-else
    class="text-muted flex h-40 items-center justify-center text-sm @3xl/stat:h-52"
  >
    {{ t('chart.empty') }}
  </div>
</template>
