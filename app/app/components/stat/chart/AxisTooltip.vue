<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import type { ChartSeries, SeriesSlug } from '~/components/stat/types'

import { formatChartAmount, formatChartTooltipLabel, resolveChartTooltipAmount, resolveChartValueType } from '~/components/stat/chart/format'
import { filterChartTooltipParams, sortChartTooltipParams } from '~/components/stat/chart/options'
import { statConfigKey } from '~/components/stat/injectionKeys'

type TooltipParam = {
  color: string
  dataIndex: number
  name: string
  seriesIndex: number
  seriesName: string
  value: number | null
}

const props = defineProps<{
  params: unknown
  period: Period
  series: ChartSeries[]
}>()

const { locale } = useI18n()
const statConfig = inject(statConfigKey)!
const isDev = import.meta.dev
const isRoundCategoryIcon = computed(() => statConfig.config.value.categories.list.isRoundIcon)
const tooltipParams = computed(() => props.params as TooltipParam[])

function getTooltipSeries(param: TooltipParam) {
  return props.series[param.seriesIndex]
}

function getTooltipValueType(param: TooltipParam): SeriesSlug | undefined {
  const chartSeries = getTooltipSeries(param)
  return chartSeries?.valueTypes?.[param.dataIndex]
    ?? resolveChartValueType(chartSeries?.showValueType, param.value)
}

function getTooltipAmount(param: TooltipParam) {
  return resolveChartTooltipAmount(param.value ?? 0, getTooltipValueType(param))
}

const rows = computed(() => sortChartTooltipParams(
  filterChartTooltipParams(tooltipParams.value),
  getTooltipAmount,
  param => getTooltipSeries(param)?.icon === 'lucide:ellipsis',
))
</script>

<template>
  <div
    class="min-w-48 overflow-hidden rounded-md bg-default shadow-lg ring ring-default"
    :data-stat-chart-tooltip="isDev ? 'true' : undefined"
  >
    <div v-if="tooltipParams[0]" class="px-2 py-1.5 text-sm text-muted capitalize">
      {{ formatChartTooltipLabel(+tooltipParams[0].name, period, locale) }}
    </div>

    <div v-if="rows.length">
      <div
        v-for="(param, i) in rows"
        :key="i"
        class="group flex items-center gap-3 px-2"
        :data-stat-chart-tooltip-icon="isDev ? getTooltipSeries(param)?.icon : undefined"
        :data-stat-chart-tooltip-value="isDev ? param.value : undefined"
      >
        <div class="flex-center min-w-8">
          <UiIconBase
            v-if="getTooltipSeries(param)?.icon && isRoundCategoryIcon"
            :color="param.color"
            :name="getTooltipSeries(param)!.icon!"
            class="w-7!"
            invert
          />
          <UiIconBase
            v-else-if="getTooltipSeries(param)?.icon"
            :color="param.color"
            :name="getTooltipSeries(param)!.icon!"
            class="w-6!"
          />
          <div v-else class="flex-center size-7 shrink-0">
            <div class="size-2.5 rounded-full" :style="`background: ${param.color}`" />
          </div>
        </div>

        <div class="flex min-h-11 min-w-0 grow items-center gap-1 border-b border-accented py-1.5 group-last:border-b-0">
          <div class="min-w-0 grow leading-none tracking-wide">
            <div class="truncate text-sm font-medium text-toned">
              {{ param.seriesName }}
            </div>
          </div>

          <div
            :class="getTooltipAmount(param) > 0 ? 'text-income-1!' : 'text-highlighted'"
            class="shrink-0 px-2 text-right font-secondary text-base"
          >
            {{ formatChartAmount(getTooltipAmount(param), locale) }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="p-3 text-sm text-muted"
      :data-stat-chart-tooltip-empty="isDev ? 'true' : undefined"
    >
      {{ $t('trns.noTrns') }}
    </div>
  </div>
</template>
