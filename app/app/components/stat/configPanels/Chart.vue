<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { ChartType } from '~/components/stat/chart/types'

import { useStatChart } from '~/components/stat/chart/useStatChart'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { chartViewOptions, resolveChartType } from '~/components/stat/useStatConfig'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const { chartTypeOptions } = useStatChart()

const isChartShow = computed(() => statConfig.config.value.isChartShow)
const isChartGrouped = computed(() => statConfig.config.value.chart.isGrouped)
const isCategoriesMode = computed(() => statConfig.config.value.chart.mode === 'categories')
const activeChartType = computed(() => resolveChartType(statConfig.config.value.chartType, statConfig.config.value.chart.mode))
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
      configKey="date"
      field="isShowQuick"
      :title="t('stat.config.date.quick.label')"
    />
    <StatConfigSwitch
      v-if="!isPie"
      configKey="chart"
      field="isShowAverage"
      :title="t('stat.config.chart.average.label')"
    />
    <UiSwitchItem
      :checkboxValue="statConfig.config.value.chart.mode === 'categories'"
      :title="t('stat.config.chart.byCategories')"
      @click="statConfig.updateConfig('chart', { mode: statConfig.config.value.chart.mode === 'categories' ? 'aggregated' : 'categories' })"
    />
    <UiSwitchItem
      v-if="statConfig.config.value.chart.mode === 'categories'"
      :checkboxValue="isChartGrouped"
      :title="t('stat.config.chart.groupByParent')"
      @click="statConfig.updateConfig('chart', { isGrouped: !isChartGrouped })"
    />

    <div class="grid gap-4 pt-4">
      <div
        v-if="!isPie"
        class="hidden gap-2 md:grid"
      >
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.config.chartView.label') }}
        </UiTitleSection>
        <UTabs
          :content="false"
          :items="chartViewItems"
          :modelValue="statConfig.config.value.chartView"
          @update:modelValue="(v) => statConfig.updateConfig('chartView', v as typeof chartViewOptions[number])"
        />
      </div>

      <div class="grid gap-2">
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.config.chart.type.label') }}
        </UiTitleSection>
        <UTabs
          :content="false"
          :items="chartTypeItems"
          :modelValue="activeChartType"
          @update:modelValue="(v) => statConfig.updateConfig('chartType', v as ChartType)"
        />
      </div>
    </div>
  </div>
</template>
