<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'

import type { QuickRangeOptionId } from '~/components/stat/date/useRangeOptions'

import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { quickRangeOptionIds, useStatDateRangeOptions } from '~/components/stat/date/useRangeOptions'

const { isShowSyncButton = false } = defineProps<{
  isShowSyncButton?: boolean
}>()

const { t } = useI18n()
const statConfig = useStatConfigCtx()
const { options: dateRangeOptions } = useStatDateRangeOptions()

const quickRangeItemById = computed(() => new Map(dateRangeOptions.value.map(option => [option.id, option])))
const quickRangeValue = computed<QuickRangeOptionId[]>(() => statConfig.date.value.quickRangeIds)
const [quickRangeSortParent, sortedQuickRangeIds] = useDragAndDrop(
  [...statConfig.date.value.quickRangeOrderIds] as QuickRangeOptionId[],
  { dragHandle: '.sortableSelectionHandle' },
)

watch(() => statConfig.date.value.quickRangeOrderIds, (ids) => {
  if (JSON.stringify(ids) !== JSON.stringify(sortedQuickRangeIds.value))
    sortedQuickRangeIds.value = [...ids]
}, { deep: true, immediate: true })

watch(sortedQuickRangeIds, (ids) => {
  if (JSON.stringify(ids) === JSON.stringify(statConfig.date.value.quickRangeOrderIds))
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
    <StatConfigPanelsChartLayout />
    <StatConfigPanelsChartPie />
    <StatConfigPanelsChartLine />
    <StatConfigPanelsChartScale />

    <StatConfigSwitch
      path="date.isShowQuick"
      :title="t('stat.config.date.quick.label')"
    />
    <StatConfigFieldRow
      v-if="statConfig.date.value.isShowQuick"
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
