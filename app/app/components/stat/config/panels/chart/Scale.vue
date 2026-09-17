<script setup lang="ts">
import { chartLayoutIcons, chartLayoutOptions, chartValueDisplayOptions, resolveChartLayoutOptions } from '~/components/stat/config/schema'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { statCanSplitKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = useStatConfigCtx()
const canSplit = inject(statCanSplitKey, computed(() => false))
const activeChartType = computed(() => statConfig.chart.value.type)

const valueDisplayItems = computed(() => chartValueDisplayOptions.map(value => ({
  label: t(`stat.view.valueDisplay.${value}.label`),
  value,
})))
const chartLayoutItems = computed(() => resolveChartLayoutOptions(statConfig.page.value.layout).map(value => ({
  icon: chartLayoutIcons[value],
  label: t(`stat.view.chartLayout.${value}.label`),
  value,
})))
</script>

<template>
  <StatConfigFieldRow v-if="activeChartType !== 'pie'" parameterId="chart.valueDisplay" :title="t('stat.view.valueDisplay.title')">
    <USelect
      class="w-40 shrink-0"
      :aria-label="t('stat.view.valueDisplay.title')"
      :content="{ position: 'item-aligned' }"
      :items="valueDisplayItems"
      :modelValue="statConfig.chart.value.valueDisplay"
      :ui="{ content: 'z-[60]' }"
      @update:modelValue="(v) => statConfig.updateConfig('chart', { valueDisplay: v as typeof chartValueDisplayOptions[number] })"
    />
  </StatConfigFieldRow>
  <StatConfigSwitch
    v-if="activeChartType !== 'pie'"
    path="chart.isShowScale"
    :title="t('stat.config.chart.scale.label')"
  />
  <StatConfigSwitch
    v-if="activeChartType !== 'pie'"
    path="chart.isShowAverage"
    :title="t('stat.config.chart.average.label')"
  />

  <StatConfigFieldRow v-if="canSplit" parameterId="chart.layout" :title="t('stat.view.chartLayout.title')">
    <USelect
      class="w-40 shrink-0"
      :aria-label="t('stat.view.chartLayout.title')"
      :content="{ position: 'item-aligned' }"
      :items="chartLayoutItems"
      :modelValue="statConfig.chart.value.layout"
      :ui="{ content: 'z-[60]' }"
      @update:modelValue="(v) => statConfig.updateConfig('chart', { layout: v as typeof chartLayoutOptions[number] })"
    />
  </StatConfigFieldRow>

  <StatConfigSwitch
    path="chart.isShowBackground"
    :title="t('stat.config.chart.background.label')"
  />
</template>
