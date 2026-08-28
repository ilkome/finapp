<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

import type { ChartType } from '~/components/stat/chart/types'
import type { QuickRangeOptionId } from '~/components/stat/date/useRangeOptions'

import { useStatChart } from '~/components/stat/chart/useStatChart'
import { chartLayoutIcons, chartLayoutOptions, chartValueDisplayOptions, pieShapeOptions } from '~/components/stat/config/schema'
import { quickRangeOptionIds, useStatDateRangeOptions } from '~/components/stat/date/useRangeOptions'
import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
const { chartTypeOptions } = useStatChart()
const { options: dateRangeOptions } = useStatDateRangeOptions()

const activeChartType = computed(() => statConfig.config.value.chart.type)
const selectUi = { content: 'z-[60]' }

const chartTypeItems = computed(() => chartTypeOptions.value.map(item => ({
  icon: item.icon.replace('lucide:', 'i-lucide-'),
  label: item.label,
  value: item.value,
})))
const activeChartTypeIcon = computed(() => chartTypeItems.value.find(item => item.value === activeChartType.value)?.icon)
const chartLayoutItems = computed(() => chartLayoutOptions.map(value => ({
  icon: chartLayoutIcons[value],
  label: t(`stat.view.chartLayout.${value}.label`),
  value,
})))
const breakdownItems = computed(() => ['cashflow', 'categories'].map(value => ({
  label: t(`stat.view.breakdown.${value}.label`),
  value,
})))
const valueDisplayItems = computed(() => chartValueDisplayOptions.map(value => ({
  label: t(`stat.view.valueDisplay.${value}.label`),
  value,
})))
const barLayoutItems = computed(() => ['stacked', 'adjacent'].map(value => ({
  label: t(`stat.view.barLayout.${value}.label`),
  value,
})))
const pieShapeItems = computed(() => pieShapeOptions.map(value => ({
  label: t(`stat.view.pieShape.${value}.label`),
  value,
})))
const activeBarLayout = computed(() => statConfig.config.value.chart.isGrouped ? 'stacked' : 'adjacent')
const quickRangeItemById = computed(() => new Map(dateRangeOptions.value.map(option => [option.id, option])))
const quickRangeValue = computed<QuickRangeOptionId[]>(() => statConfig.config.value.date.quickRangeIds)
const [quickRangeSortParent, sortedQuickRangeIds] = useDragAndDrop(
  [...statConfig.config.value.date.quickRangeOrderIds] as QuickRangeOptionId[],
  { dragHandle: '.quickRangeSortHandle' },
)

watch(() => statConfig.config.value.date.quickRangeOrderIds, (ids) => {
  if (JSON.stringify(ids) !== JSON.stringify(sortedQuickRangeIds.value))
    sortedQuickRangeIds.value = [...ids]
}, { deep: true, immediate: true })

watch(sortedQuickRangeIds, (ids) => {
  if (JSON.stringify(ids) === JSON.stringify(statConfig.config.value.date.quickRangeOrderIds))
    return
  statConfig.config.value.date.quickRangeOrderIds.splice(
    0,
    statConfig.config.value.date.quickRangeOrderIds.length,
    ...ids,
  )
}, { deep: true })

function replaceQuickRangeIds(ids: QuickRangeOptionId[]) {
  const selected = new Set(ids)
  const normalized = quickRangeOptionIds.filter(id => selected.has(id))
  statConfig.config.value.date.quickRangeIds.splice(0, statConfig.config.value.date.quickRangeIds.length, ...normalized)
}

function setQuickRange(id: QuickRangeOptionId, isSelected: boolean) {
  const selected = new Set(quickRangeValue.value)

  if (isSelected)
    selected.add(id)
  else
    selected.delete(id)

  replaceQuickRangeIds([...selected])
}

function moveQuickRange(id: QuickRangeOptionId, direction: -1 | 1) {
  const index = sortedQuickRangeIds.value.indexOf(id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= sortedQuickRangeIds.value.length)
    return
  const next = [...sortedQuickRangeIds.value]
  const current = next[index]!
  next[index] = next[target]!
  next[target] = current
  sortedQuickRangeIds.value = next
}

const quickRangeSelectionLabel = computed(() => {
  if (quickRangeValue.value.length === 1)
    return quickRangeItemById.value.get(quickRangeValue.value[0]!)?.label
  return t('stat.config.date.quick.selected', { count: quickRangeValue.value.length })
})
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <StatConfigFieldRow :title="t('stat.view.chartType.title')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.view.chartType.title')"
        :content="{ position: 'item-aligned' }"
        :icon="activeChartTypeIcon"
        :items="chartTypeItems"
        :modelValue="activeChartType"
        :ui="selectUi"
        @update:modelValue="(v) => statConfig.updateConfig('chart', { type: v as ChartType })"
      />
    </StatConfigFieldRow>

    <StatConfigFieldRow :title="t('stat.view.breakdown.title')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.view.breakdown.title')"
        :content="{ position: 'item-aligned' }"
        :items="breakdownItems"
        :modelValue="statConfig.config.value.chart.breakdown"
        :ui="selectUi"
        @update:modelValue="(v) => statConfig.updateConfig('chart', { breakdown: v as 'cashflow' | 'categories' })"
      />
    </StatConfigFieldRow>

    <StatConfigFieldRow v-if="activeChartType === 'pie'" :title="t('stat.view.pieShape.title')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.view.pieShape.title')"
        :content="{ position: 'item-aligned' }"
        :items="pieShapeItems"
        :modelValue="statConfig.config.value.chart.pie.shape"
        :ui="selectUi"
        @update:modelValue="(v) => statConfig.updateConfig('chart', { pie: { shape: v as typeof pieShapeOptions[number] } })"
      />
    </StatConfigFieldRow>
    <StatConfigSwitch
      v-if="activeChartType === 'pie'"
      path="chart.pie.isShowLabels"
      :title="t('stat.config.chart.pie.showLabels')"
    />
    <StatConfigSwitch
      v-if="activeChartType === 'pie'"
      path="chart.pie.isShowPercent"
      :title="t('stat.config.chart.pie.showPercent')"
    />

    <StatConfigFieldRow v-if="activeChartType === 'bar'" :title="t('stat.view.barLayout.title')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.view.barLayout.title')"
        :content="{ position: 'item-aligned' }"
        :items="barLayoutItems"
        :modelValue="activeBarLayout"
        :ui="selectUi"
        @update:modelValue="(v) => statConfig.updateConfig('chart', { isGrouped: v === 'stacked' })"
      />
    </StatConfigFieldRow>

    <template v-if="activeChartType === 'line'">
      <StatConfigSwitch
        path="chart.line.isShowPoints"
        :title="t('stat.config.chart.line.showPoints')"
      />
      <StatConfigSwitch
        path="chart.line.isSmooth"
        :title="t('stat.config.chart.line.smooth')"
      />
      <StatConfigSwitch
        path="chart.line.isGradient"
        :title="t('stat.config.chart.line.gradient')"
      />
      <StatConfigSwitch
        path="chart.line.isSkipZero"
        :title="t('stat.config.chart.line.skipZero')"
      />
    </template>

    <StatConfigFieldRow v-if="activeChartType !== 'pie'" :title="t('stat.view.valueDisplay.title')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.view.valueDisplay.title')"
        :content="{ position: 'item-aligned' }"
        :items="valueDisplayItems"
        :modelValue="statConfig.config.value.chart.valueDisplay"
        :ui="selectUi"
        @update:modelValue="(v) => statConfig.updateConfig('chart', { valueDisplay: v as typeof chartValueDisplayOptions[number] })"
      />
    </StatConfigFieldRow>
    <StatConfigSwitch
      v-if="activeChartType !== 'pie'"
      path="chart.isShowScale"
      :title="t('stat.config.chart.scale.label')"
    />

    <StatConfigFieldRow v-if="canSplit" :title="t('stat.view.chartLayout.title')">
      <USelect
        class="w-40 shrink-0"
        :aria-label="t('stat.view.chartLayout.title')"
        :content="{ position: 'item-aligned' }"
        :items="chartLayoutItems"
        :modelValue="statConfig.config.value.chart.layout"
        :ui="selectUi"
        @update:modelValue="(v) => statConfig.updateConfig('chart', { layout: v as typeof chartLayoutOptions[number] })"
      />
    </StatConfigFieldRow>

    <StatConfigSwitch
      path="chart.isShowBackground"
      :title="t('stat.config.chart.background.label')"
    />
    <StatConfigSwitch
      path="date.isShowQuick"
      :title="t('stat.config.date.quick.label')"
    />
    <StatConfigFieldRow
      v-if="statConfig.config.value.date.isShowQuick"
      :title="t('stat.config.date.quick.period')"
    >
      <UPopover
        :content="{
          align: 'end',
          side: 'bottom',
          sideOffset: 8,
        }"
        :ui="{
          content: 'z-[60] max-h-96 max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain md:max-h-[calc(100dvh-2rem)]',
        }"
      >
        <UButton
          class="w-40 shrink-0 justify-between"
          color="neutral"
          variant="outline"
          trailingIcon="i-lucide-chevron-down"
          :aria-label="t('stat.config.date.quick.period')"
        >
          <span class="truncate">
            {{ quickRangeSelectionLabel }}
          </span>
        </UButton>

        <template #content>
          <div ref="quickRangeSortParent" class="grid min-w-56 gap-1 p-2">
            <div
              v-for="id in sortedQuickRangeIds"
              :key="id"
              class="theme-rounded-control flex items-center gap-1 text-sm text-highlighted hover:bg-elevated"
            >
              <button
                type="button"
                class="flex min-w-0 grow items-center gap-2 py-2 pr-1 pl-2.5"
                role="checkbox"
                :aria-checked="quickRangeValue.includes(id)"
                @click="setQuickRange(id, !quickRangeValue.includes(id))"
              >
                <Icon
                  v-if="quickRangeValue.includes(id)"
                  name="lucide:check"
                  class="shrink-0 text-primary"
                  size="16"
                />
                <span v-else class="size-4 shrink-0" />
                <span class="grow truncate text-left">{{ quickRangeItemById.get(id)?.label }}</span>
              </button>
              <div
                class="quickRangeSortHandle mr-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted hover:bg-accented active:cursor-grabbing"
                role="button"
                tabindex="0"
                :aria-label="t('stat.views.drag')"
                @keydown.up.prevent="moveQuickRange(id, -1)"
                @keydown.down.prevent="moveQuickRange(id, 1)"
              >
                <Icon name="lucide:grip-vertical" size="20" />
              </div>
            </div>
          </div>
        </template>
      </UPopover>
    </StatConfigFieldRow>
    <StatConfigSwitch
      v-if="activeChartType !== 'pie'"
      path="chart.isShowAverage"
      :title="t('stat.config.chart.average.label')"
    />
  </div>
</template>
