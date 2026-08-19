<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { ChartType } from '~/components/stat/chart/types'

import { useStatChart } from '~/components/stat/chart/useStatChart'
import { chartLayoutOptions } from '~/components/stat/config/schema'
import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
const { chartTypeOptions } = useStatChart()

const isChartShow = computed(() => statConfig.config.value.chart.isShow)
const activeChartType = computed(() => statConfig.config.value.chart.type)

const chartTypeItems = computed<TabsItem[]>(() => chartTypeOptions.value.map(item => ({
  icon: item.icon.replace('lucide:', 'i-lucide-'),
  label: item.label,
  value: item.value,
})))
const chartLayoutItems = computed<TabsItem[]>(() => chartLayoutOptions.map(value => ({
  label: t(`stat.view.chartLayout.${value}.label`),
  value,
})))
const breakdownItems = computed<TabsItem[]>(() => ['cashflow', 'categories'].map(value => ({
  label: t(`stat.view.breakdown.${value}.label`),
  value,
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
      path="chart.isShowAverage"
      :title="t('stat.config.chart.average.label')"
    />
    <StatConfigSwitch
      v-if="statConfig.config.value.chart.breakdown === 'categories'"
      path="chart.isGrouped"
      :title="t('stat.config.chart.groupByParent')"
    />

    <div class="grid gap-4 pt-4">
      <div v-if="canSplit" class="grid gap-2">
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.view.chartLayout.title') }}
        </UiTitleSection>
        <UiTabs
          :items="chartLayoutItems"
          :modelValue="statConfig.config.value.chart.layout"
          @update:modelValue="(v) => statConfig.updateConfig('chart', { layout: v as typeof chartLayoutOptions[number] })"
        />
      </div>

      <div class="grid gap-2">
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.view.chartType.title') }}
        </UiTitleSection>
        <UiTabs
          :items="chartTypeItems"
          :modelValue="activeChartType"
          @update:modelValue="(v) => statConfig.updateConfig('chart', { type: v as ChartType })"
        />
      </div>

      <div class="grid gap-2">
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.view.breakdown.title') }}
        </UiTitleSection>
        <UiTabs
          :items="breakdownItems"
          :modelValue="statConfig.config.value.chart.breakdown"
          @update:modelValue="(v) => statConfig.updateConfig('chart', { breakdown: v as 'cashflow' | 'categories' })"
        />
      </div>
    </div>
  </div>
</template>
