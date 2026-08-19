<script setup lang="ts">
import type { ChartType } from '~/components/stat/chart/types'

import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
function options(key: string, values: Array<{ icon: string, value: string }>) {
  return values.map(item => ({ ...item, description: t(`stat.view.${key}.${item.value}.description`), label: t(`stat.view.${key}.${item.value}.label`) }))
}
const chartLayoutOptions = computed(() => options('chartLayout', [
  { icon: 'i-lucide-layout-panel-top', value: 'combined-wide' },
  { icon: 'i-lucide-panels-top-left', value: 'split' },
  { icon: 'i-lucide-layout-panel-top', value: 'combined-narrow' },
]))
const chartTypeOptions = computed(() => options('chartType', [{ icon: 'i-lucide-chart-column', value: 'bar' }, { icon: 'i-lucide-chart-spline', value: 'line' }, { icon: 'i-lucide-chart-pie', value: 'pie' }]))
const breakdownOptions = computed(() => options('breakdown', [{ icon: 'i-lucide-arrow-down-up', value: 'cashflow' }, { icon: 'i-hugeicons-folder-library', value: 'categories' }]))
const pageLayoutOptions = computed(() => options('pageLayout', [{ icon: 'i-lucide-rows-3', value: 'combined' }, { icon: 'i-lucide-columns-2', value: 'split' }]))
</script>

<template>
  <div class="flex w-max items-center gap-2">
    <StatViewMenu v-if="canSplit" :label="t('stat.view.chartLayout.title')" :modelValue="statConfig.config.value.chart.layout" :options="chartLayoutOptions" @update:modelValue="statConfig.updateConfig('chart', { layout: $event as 'combined-wide' | 'split' | 'combined-narrow' })" />
    <StatViewMenu :label="t('stat.view.chartType.title')" :modelValue="statConfig.config.value.chart.type" :options="chartTypeOptions" @update:modelValue="statConfig.updateConfig('chart', { type: $event as ChartType })" />
    <StatViewMenu :label="t('stat.view.breakdown.title')" :modelValue="statConfig.config.value.chart.breakdown" :options="breakdownOptions" @update:modelValue="statConfig.updateConfig('chart', { breakdown: $event as 'cashflow' | 'categories' })" />
    <StatViewMenu v-if="canSplit" :label="t('stat.view.pageLayout.title')" :modelValue="statConfig.config.value.page.layout" :options="pageLayoutOptions" @update:modelValue="statConfig.updateConfig('page', { layout: $event as 'combined' | 'split' })" />
  </div>
</template>
