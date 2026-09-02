<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

import type { ChartType } from '~/components/stat/chart/types'
import type { QuickRangeOptionId } from '~/components/stat/date/useRangeOptions'

import { useStatChart } from '~/components/stat/chart/useStatChart'
import { chartLayoutIcons, chartLayoutOptions, chartValueDisplayOptions, pieShapeOptions } from '~/components/stat/config/schema'
import { quickRangeOptionIds, useStatDateRangeOptions } from '~/components/stat/date/useRangeOptions'
import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

const { isShowSyncButton = false } = defineProps<{
  isShowSyncButton?: boolean
}>()

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
const chartLayoutItems = computed(() => chartLayoutOptions.map(value => ({
  icon: chartLayoutIcons[value],
  label: t(`stat.view.chartLayout.${value}.label`),
  value,
})))
const breakdownItems = computed(() => ['cashflow', 'categories'].map(value => ({
  icon: value === 'cashflow' ? 'i-lucide-arrow-down-up' : 'i-hugeicons-folder-library',
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
  icon: 'i-lucide-circle',
  label: t(`stat.view.pieShape.${value}.label`),
  value,
})))
const activeBarLayout = computed(() => statConfig.config.value.chart.isGrouped ? 'stacked' : 'adjacent')
const quickRangeItemById = computed(() => new Map(dateRangeOptions.value.map(option => [option.id, option])))
const quickRangeValue = computed<QuickRangeOptionId[]>(() => statConfig.config.value.date.quickRangeIds)
const [quickRangeSortParent, sortedQuickRangeIds] = useDragAndDrop(
  [...statConfig.config.value.date.quickRangeOrderIds] as QuickRangeOptionId[],
  { dragHandle: '.sortableSelectionHandle' },
)

watch(() => statConfig.config.value.date.quickRangeOrderIds, (ids) => {
  if (JSON.stringify(ids) !== JSON.stringify(sortedQuickRangeIds.value))
    sortedQuickRangeIds.value = [...ids]
}, { deep: true, immediate: true })

watch(sortedQuickRangeIds, (ids) => {
  if (JSON.stringify(ids) === JSON.stringify(statConfig.config.value.date.quickRangeOrderIds))
    return
  statConfig.updateConfig('date', { quickRangeOrderIds: [...ids] })
}, { deep: true })

function replaceQuickRangeIds(ids: QuickRangeOptionId[]) {
  const selected = new Set(ids)
  const normalized = quickRangeOptionIds.filter(id => selected.has(id))
  statConfig.updateConfig('date', { quickRangeIds: normalized })
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

    <StatConfigFieldRow parameterId="chart.breakdown" :title="t('stat.view.breakdown.title')">
      <UTabs
        class="w-40 shrink-0"
        :content="false"
        :items="breakdownItems"
        :modelValue="statConfig.config.value.chart.breakdown"
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

    <StatConfigFieldRow v-if="activeChartType === 'pie'" parameterId="chart.pie.shape" :title="t('stat.view.pieShape.title')">
      <UTabs
        class="w-40 shrink-0"
        :content="false"
        :items="pieShapeItems"
        :modelValue="statConfig.config.value.chart.pie.shape"
        size="md"
        :ui="{
          label: 'sr-only',
          list: 'w-full',
          trigger: 'min-w-0',
        }"
        @update:modelValue="(v) => statConfig.updateConfig('chart', { pie: { shape: v as typeof pieShapeOptions[number] } })"
      >
        <template #leading="{ item }">
          <UTooltip :text="item.label">
            <span
              v-if="item.value === 'circle'"
              aria-hidden="true"
              class="size-5 shrink-0 rounded-full bg-current"
            />
            <Icon v-else :name="item.icon" class="size-5 shrink-0" />
          </UTooltip>
        </template>
      </UTabs>
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

    <StatConfigFieldRow v-if="activeChartType === 'bar'" parameterId="chart.isGrouped" :title="t('stat.view.barLayout.title')">
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

    <StatConfigFieldRow v-if="activeChartType !== 'pie'" parameterId="chart.valueDisplay" :title="t('stat.view.valueDisplay.title')">
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
      parameterId="date.quickRanges"
      :title="t('stat.config.date.quick.period')"
    >
      <UPopover
        :content="{
          align: 'end',
          side: 'bottom',
          sideOffset: 8,
        }"
        :ui="{
          content: 'z-[60] max-w-[calc(100vw-1rem)] overflow-hidden',
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
          <div
            ref="quickRangeSortParent"
            class="scroller grid min-w-56 gap-1 overflow-y-auto overscroll-contain p-2"
            style="max-height: var(--reka-popper-available-height, 60dvh)"
          >
            <UiSortableSelectionItem
              v-for="id in sortedQuickRangeIds"
              :key="id"
              :ariaLabel="t('stat.views.drag')"
              :isSelected="quickRangeValue.includes(id)"
              selectionMode="multiple"
              @move="direction => moveQuickRange(id, direction)"
              @select="setQuickRange(id, !quickRangeValue.includes(id))"
            >
              {{ quickRangeItemById.get(id)?.label }}
            </UiSortableSelectionItem>
          </div>
        </template>
      </UPopover>
    </StatConfigFieldRow>
    <StatConfigSyncPanelButton v-if="isShowSyncButton" panel="chart" />
  </div>
</template>
