<script setup lang="ts">
import type { ChartType } from '~/components/stat/chart/types'

import { useStatChart } from '~/components/stat/chart/useStatChart'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'

const { t } = useI18n()
const statConfig = useStatConfigCtx()
const { chartTypeOptions } = useStatChart()

const activeChartType = computed(() => statConfig.chart.value.type)

const chartTypeItems = computed(() => chartTypeOptions.value.map(item => ({
  icon: item.icon.replace('lucide:', 'i-lucide-'),
  label: item.label,
  value: item.value,
})))
const breakdownItems = computed(() => ['cashflow', 'categories'].map(value => ({
  icon: value === 'cashflow' ? 'i-lucide-arrow-down-up' : 'i-hugeicons-folder-library',
  label: t(`stat.view.breakdown.${value}.label`),
  value,
})))
const barLayoutItems = computed(() => ['stacked', 'adjacent'].map(value => ({
  label: t(`stat.view.barLayout.${value}.label`),
  value,
})))
const activeBarLayout = computed(() => statConfig.chart.value.isGrouped ? 'stacked' : 'adjacent')
</script>

<template>
  <StatConfigFieldRow parameterId="chart.type" :title="t('stat.view.chartType.title')">
    <UTabs
      class="w-40 shrink-0"
      :content="false"
      :items="chartTypeItems"
      :modelValue="activeChartType"
      size="md"
      :ui="{
        label: 'sr-only',
        list: 'w-full',
        trigger: 'min-w-0',
      }"
      @update:modelValue="(v) => statConfig.updateConfig('chart', { type: v as ChartType })"
    >
      <template #leading="{ item }">
        <UTooltip :text="item.label">
          <Icon :name="item.icon" class="size-5 shrink-0" />
        </UTooltip>
      </template>
    </UTabs>
  </StatConfigFieldRow>

  <StatConfigCategoryGroupingSelect
    v-if="statConfig.chart.value.breakdown === 'categories'"
    :modelValue="statConfig.chart.value.grouping"
    parameterId="chart.grouping"
    @update:modelValue="value => statConfig.updateConfig('chart', { grouping: value })"
  />

  <StatConfigFieldRow parameterId="chart.breakdown" :title="t('stat.view.breakdown.title')">
    <UTabs
      class="w-40 shrink-0"
      :content="false"
      :items="breakdownItems"
      :modelValue="statConfig.chart.value.breakdown"
      size="md"
      :ui="{
        label: 'sr-only',
        list: 'w-full',
        trigger: 'min-w-0',
      }"
      @update:modelValue="(v) => statConfig.updateConfig('chart', { breakdown: v as 'cashflow' | 'categories' })"
    >
      <template #leading="{ item }">
        <UTooltip :text="item.label">
          <Icon :name="item.icon" class="size-5 shrink-0" />
        </UTooltip>
      </template>
    </UTabs>
  </StatConfigFieldRow>

  <StatConfigFieldRow v-if="activeChartType === 'bar'" parameterId="chart.isGrouped" :title="t('stat.view.barLayout.title')">
    <USelect
      class="w-40 shrink-0"
      :aria-label="t('stat.view.barLayout.title')"
      :content="{ position: 'item-aligned' }"
      :items="barLayoutItems"
      :modelValue="activeBarLayout"
      :ui="{ content: 'z-[60]' }"
      @update:modelValue="(v) => statConfig.updateConfig('chart', { isGrouped: v === 'stacked' })"
    />
  </StatConfigFieldRow>
</template>
