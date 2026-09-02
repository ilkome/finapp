<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import type { ChartSeries, SeriesSlug } from '~/components/stat/types'

import { formatChartAmount, formatChartTooltipLabel, resolveChartTooltipAmount, resolveChartValueType } from '~/components/stat/chart/format'
import { filterChartTooltipParams, resolveChartTooltipSeries, resolveChartTooltipValue, sortChartTooltipParams } from '~/components/stat/chart/options'
import { statConfigKey } from '~/components/stat/injectionKeys'

type ChartTooltipRow = {
  amount: number
  color?: string
  description?: string
  icon?: string
  key: string
  name: string
  value?: number | null
}

type TooltipParam = {
  color: string
  dataIndex: number
  name: string
  seriesIndex: number
  seriesName: string
  value: number | null
}
type RawTooltipParam = Omit<TooltipParam, 'value'> & { value: number | [unknown, number] | null }

const props = defineProps<{
  params?: unknown
  period?: Period
  rows?: ChartTooltipRow[]
  series?: ChartSeries[]
  title?: string
}>()

const { locale } = useI18n()
const statConfig = inject(statConfigKey)!
const isDev = import.meta.dev
const isRoundCategoryIcon = computed(() => statConfig.config.value.categories.list.isRoundIcon)
const tooltipParams = computed<TooltipParam[]>(() => (Array.isArray(props.params) ? props.params as RawTooltipParam[] : []).map(param => ({
  ...param,
  value: resolveChartTooltipValue(param.value),
})))

function getTooltipSeries(param: TooltipParam) {
  return resolveChartTooltipSeries(props.series, param)
}

function getTooltipColor(param: TooltipParam) {
  return getTooltipSeries(param)?.color ?? param.color
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
const axisRows = computed<ChartTooltipRow[]>(() => rows.value.map((param, index) => ({
  amount: getTooltipAmount(param),
  color: getTooltipColor(param),
  icon: getTooltipSeries(param)?.icon,
  key: `${param.seriesIndex}-${param.dataIndex}-${index}`,
  name: param.seriesName,
  value: param.value,
})))
const tooltipRows = computed(() => props.rows ?? axisRows.value)
const title = computed(() => props.title ?? (tooltipParams.value[0] && props.period
  ? formatChartTooltipLabel(+tooltipParams.value[0].name, props.period, locale.value)
  : undefined))
</script>

<template>
  <div
    class="min-w-48 overflow-hidden rounded-md bg-default shadow-lg ring ring-default"
    :data-stat-chart-tooltip="isDev ? 'true' : undefined"
  >
    <div v-if="title" class="px-2 py-1.5 text-sm text-muted capitalize">
      {{ title }}
    </div>

    <div v-if="tooltipRows.length">
      <div
        v-for="row in tooltipRows"
        :key="row.key"
        class="group flex items-center gap-3 px-2"
        :data-stat-chart-tooltip-icon="isDev ? row.icon : undefined"
        :data-stat-chart-tooltip-value="isDev ? row.value : undefined"
      >
        <div class="flex-center min-w-8">
          <UiIconBase
            v-if="row.icon && isRoundCategoryIcon"
            :color="row.color"
            :name="row.icon"
            class="w-7!"
            invert
          />
          <UiIconBase
            v-else-if="row.icon"
            :color="row.color"
            :name="row.icon"
            class="w-6!"
          />
          <div v-else class="flex-center size-7 shrink-0">
            <div class="size-2.5 rounded-full" :style="{ background: row.color }" />
          </div>
        </div>

        <div class="flex min-h-11 min-w-0 grow items-center gap-1 border-b border-accented py-1.5 group-last:border-b-0">
          <div class="min-w-0 grow leading-none tracking-wide">
            <div class="truncate text-sm font-medium text-toned">
              {{ row.name }}
            </div>
            <div v-if="row.description" class="mt-1 truncate text-xs text-muted">
              {{ row.description }}
            </div>
          </div>

          <div
            :class="row.amount > 0 ? 'text-income-1!' : 'text-highlighted'"
            class="shrink-0 px-2 text-right font-secondary text-base"
          >
            {{ formatChartAmount(row.amount, locale) }}
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
