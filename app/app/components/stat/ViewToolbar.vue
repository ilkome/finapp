<script setup lang="ts">
import type { ChartType } from '~/components/stat/chart/types'

import { chartLayoutIcons, chartLayoutOptions as chartLayoutValues } from '~/components/stat/config/schema'
import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
function options(key: string, values: Array<{ icon: string, keepOpen?: boolean, value: string }>) {
  return values.map(item => ({ ...item, description: t(`stat.view.${key}.${item.value}.description`), label: t(`stat.view.${key}.${item.value}.label`) }))
}
const chartLayoutOptions = computed(() => options('chartLayout', chartLayoutValues.map(value => ({
  icon: chartLayoutIcons[value],
  value,
}))))
const chartTypeOptions = computed(() => options('chartType', [
  { icon: 'i-lucide-chart-column', value: 'bar' },
  { icon: 'i-lucide-chart-spline', keepOpen: true, value: 'line' },
  { icon: 'i-lucide-chart-pie', value: 'pie' },
]))
const lineSettings = computed(() => [
  {
    checked: statConfig.config.value.chart.line.isShowPoints,
    label: t('stat.config.chart.line.showPoints'),
    onUpdateChecked: (value: boolean) => statConfig.updateConfig('chart', { line: { isShowPoints: value } }),
  },
  {
    checked: statConfig.config.value.chart.line.isGradient,
    label: t('stat.config.chart.line.gradient'),
    onUpdateChecked: (value: boolean) => statConfig.updateConfig('chart', { line: { isGradient: value } }),
  },
  {
    checked: statConfig.config.value.chart.line.isSkipZero,
    label: t('stat.config.chart.line.skipZero'),
    onUpdateChecked: (value: boolean) => statConfig.updateConfig('chart', { line: { isSkipZero: value } }),
  },
  {
    checked: statConfig.config.value.chart.line.isSmooth,
    label: t('stat.config.chart.line.smooth'),
    onUpdateChecked: (value: boolean) => statConfig.updateConfig('chart', { line: { isSmooth: value } }),
  },
])
const breakdownOptions = computed(() => options('breakdown', [{ icon: 'i-lucide-arrow-down-up', value: 'cashflow' }, { icon: 'i-hugeicons-folder-library', value: 'categories' }]))
const pageLayoutOptions = computed(() => options('pageLayout', [{ icon: 'i-lucide-rows-3', value: 'combined' }, { icon: 'i-lucide-columns-2', value: 'split' }]))
</script>

<template>
  <div class="flex w-max items-center gap-2">
    <StatViewMenu v-if="canSplit" :label="t('stat.view.chartLayout.title')" :modelValue="statConfig.config.value.chart.layout" :options="chartLayoutOptions" @update:modelValue="statConfig.updateConfig('chart', { layout: $event as 'combined-wide' | 'split' | 'combined-narrow' })" />
    <StatViewMenu :label="t('stat.view.chartType.title')" :modelValue="statConfig.config.value.chart.type" :options="chartTypeOptions" :settings="statConfig.config.value.chart.type === 'line' ? lineSettings : undefined" @update:modelValue="statConfig.updateConfig('chart', { type: $event as ChartType })" />
    <StatViewMenu :label="t('stat.view.breakdown.title')" :modelValue="statConfig.config.value.chart.breakdown" :options="breakdownOptions" @update:modelValue="statConfig.updateConfig('chart', { breakdown: $event as 'cashflow' | 'categories' })" />
    <StatViewMenu v-if="canSplit" :label="t('stat.view.pageLayout.title')" :modelValue="statConfig.config.value.page.layout" :options="pageLayoutOptions" @update:modelValue="statConfig.updateConfig('page', { layout: $event as 'combined' | 'split' })" />
  </div>
</template>
