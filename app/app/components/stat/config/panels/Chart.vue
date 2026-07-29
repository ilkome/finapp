<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { ChartType } from '~/components/stat/chart/types'

import { useStatChart } from '~/components/stat/chart/useStatChart'
import { chartViewOptions, resolveChartType } from '~/components/stat/config/schema'
import { statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const { chartTypeOptions } = useStatChart()

const isChartShow = computed(() => statConfig.config.value.chart.isShow)
const isCategoriesMode = computed(() => statConfig.config.value.chart.isByCategories)
const activeChartType = computed(() => resolveChartType(statConfig.config.value.chart.type, statConfig.config.value.chart.isByCategories))
const isPie = computed(() => activeChartType.value === 'pie')

// Pie is only meaningful for the per-category breakdown.
const visibleChartTypeOptions = computed(() =>
  chartTypeOptions.value.filter(option => !option.categoriesOnly || isCategoriesMode.value),
)

const chartViewItems = computed<TabsItem[]>(() => chartViewOptions.map(view => ({ label: t(`stat.config.chartView.${view}`), value: view })))
const chartTypeItems = computed<TabsItem[]>(() => visibleChartTypeOptions.value.map(item => ({
  icon: item.icon.replace('lucide:', 'i-lucide-'),
  label: item.label,
  value: item.value,
})))
</script>

<template>
  <div
    class="grid gap-0.5 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !isChartShow }"
  >
    <StatConfigSwitch
      path="date.isShowQuick"
      :title="t('stat.config.date.quick.label')"
    />
    <StatConfigSwitch
      v-if="!isPie"
      path="chart.isShowAverage"
      :title="t('stat.config.chart.average.label')"
    />
    <StatConfigSwitch
      path="chart.isByCategories"
      :title="t('stat.config.chart.byCategories')"
    />
    <StatConfigSwitch
      v-if="statConfig.config.value.chart.isByCategories"
      path="chart.isGrouped"
      :title="t('stat.config.chart.groupByParent')"
    />

    <div class="grid gap-4 pt-4">
      <div
        v-if="!isPie"
        class="hidden gap-2 md:grid"
      >
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.config.chartView.label') }}
        </UiTitleSection>
        <UiTabs
          :items="chartViewItems"
          :modelValue="statConfig.config.value.chart.view"
          @update:modelValue="(v) => statConfig.updateConfig('chart', { view: v as typeof chartViewOptions[number] })"
        />
      </div>

      <div class="grid gap-2">
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.config.chart.type.label') }}
        </UiTitleSection>
        <UiTabs
          :items="chartTypeItems"
          :modelValue="activeChartType"
          @update:modelValue="(v) => statConfig.updateConfig('chart', { type: v as ChartType })"
        />
      </div>
    </div>
  </div>
</template>
