<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { StatDateRangeParams } from '~/components/stat/date/types'
import type { QuickRangeOptionId, StatDateRangeOption, StatDateRangeView } from '~/components/stat/date/useRangeOptions'

const props = withDefaults(defineProps<{
  isShowRangeAdjust?: boolean
  itemClass?: string
  optionIds?: QuickRangeOptionId[]
  options: StatDateRangeOption[]
  params: StatDateRangeParams
  presetUnit?: 'day' | 'month' | 'year'
  size?: 'md' | 'sm' | 'xs'
  tabsClass?: string
  vertical?: boolean
  view: StatDateRangeView | 'all'
}>(), { size: 'sm' })

const emit = defineEmits<{
  select: [option: StatDateRangeOption]
  updateRangeDuration: [duration: number]
}>()

const items = computed(() => {
  const enabled = props.optionIds ? new Set(props.optionIds) : undefined
  const order = new Map(props.optionIds?.map((id, index) => [id, index]) ?? [])
  return props.options.filter((item) => {
    if ((props.view !== 'all' && item.view !== props.view) || (enabled && !enabled.has(item.id)))
      return false
    return item.view !== 'presets' || !props.presetUnit || item.range.rangeBy === props.presetUnit
  }).toSorted((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER))
})

const tabItems = computed<TabsItem[]>(() => items.value.map(item => ({ label: item.label, value: item.id })))

const selectedRangeId = computed(() => items.value.find(item => item.view !== 'maximum'
  && item.range.rangeBy === props.params.rangeBy
  && item.range.rangeDuration === props.params.rangeDuration)?.id)

const selectedMaxRangeId = computed(() => props.params.isShowMaxRange
  ? items.value.find(item => item.view === 'maximum' && item.isSkipEmpty === props.params.isSkipEmpty)?.id
  : undefined)

// The maximum tabs only highlight the all-time option; every other view highlights the period.
const selectedId = computed(() => {
  if (props.view === 'maximum')
    return selectedMaxRangeId.value
  return props.view === 'all' ? selectedMaxRangeId.value ?? selectedRangeId.value : selectedRangeId.value
})

function onSelect(id: string | number) {
  const item = items.value.find(option => option.id === id)
  if (item)
    emit('select', item)
}
</script>

<template>
  <div :class="props.vertical ? 'grid content-start gap-1' : 'flex shrink-0 items-center gap-1'">
    <UiTabs
      v-if="tabItems.length"
      :align="props.vertical ? 'left' : 'center'"
      :class="cn(props.vertical && 'flex-col overflow-visible', props.tabsClass)"
      :grow="!props.vertical"
      :itemClass="props.itemClass"
      :size
      :items="tabItems"
      :modelValue="selectedId"
      @update:modelValue="onSelect"
    />

    <UiNumberStepper
      v-if="props.isShowRangeAdjust && !props.params.isShowMaxRange"
      :modelValue="props.params.rangeDuration"
      :min="1"
      @update:modelValue="emit('updateRangeDuration', $event)"
    />
  </div>
</template>
