<script setup lang="ts">
import { useStatChart } from '~/components/stat/chart/useStatChart'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { chartViewOptions, resolveChartType, resolveGrouped } from '~/components/stat/useStatConfig'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const { chartTypeOptions } = useStatChart()

const isChartShow = computed(() => statConfig.config.value.isChartShow)
const grouping = computed(() => statConfig.config.value.grouping)
const isAutoGrouping = computed(() => grouping.value === 'auto')
const isChartGrouped = computed(() => resolveGrouped(statConfig.config.value.chart.isGrouped, grouping.value))
const isCategoriesMode = computed(() => statConfig.config.value.chart.mode === 'categories')
const activeChartType = computed(() => resolveChartType(statConfig.config.value.chartType, statConfig.config.value.chart.mode))
const isPie = computed(() => activeChartType.value === 'pie')

// Pie is only meaningful for the per-category breakdown.
const visibleChartTypeOptions = computed(() =>
  chartTypeOptions.value.filter(option => !option.categoriesOnly || isCategoriesMode.value),
)

function toggleGroupedWithReset(currentEffective: boolean) {
  if (!isAutoGrouping.value) {
    statConfig.updateConfig('grouping', 'auto')
    return
  }
  statConfig.updateConfig('chart', { isGrouped: !currentEffective })
}
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
      @click="toggleGroupedWithReset(isChartGrouped)"
    />

    <div class="grid gap-4 pt-4">
      <div
        v-if="!isPie"
        class="hidden gap-2 md:grid"
      >
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.config.chartView.label') }}
        </UiTitleSection>
        <UiTabsBar>
          <UiTabsItemPill
            v-for="view in chartViewOptions"
            :key="view"
            variant="outline"
            :isActive="statConfig.config.value.chartView === view"
            class="grow"
            @click="statConfig.updateConfig('chartView', view)"
          >
            {{ t(`stat.config.chartView.${view}`) }}
          </UiTabsItemPill>
        </UiTabsBar>
      </div>

      <div class="grid gap-2">
        <UiTitleSection size="sm" class="px-1">
          {{ t('stat.config.chart.type.label') }}
        </UiTitleSection>
        <UiTabsBar>
          <UiTabsItemPill
            v-for="item in visibleChartTypeOptions"
            :key="item.value"
            variant="outline"
            :isActive="activeChartType === item.value"
            class="flex grow gap-1"
            @click="statConfig.updateConfig('chartType', item.value)"
          >
            <Icon :name="item.icon" :size="16" />
            {{ item.label }}
          </UiTabsItemPill>
        </UiTabsBar>
      </div>
    </div>
  </div>
</template>
