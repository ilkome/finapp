<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { QuickRangeOptionId, StatDateRangeView } from '~/components/stat/date/useRangeOptions'
import type { StatDateProvider } from '~/components/stat/date/types'

import { useStatDateRangeOptions } from '~/components/stat/date/useRangeOptions'

const props = withDefaults(defineProps<{
  isShowRangeAdjust?: boolean
  itemClass?: string
  optionIds?: QuickRangeOptionId[]
  presetUnit?: 'day' | 'month' | 'year'
  size?: 'md' | 'sm' | 'xs'
  statDate: StatDateProvider
  tabsClass?: string
  vertical?: boolean
  view: StatDateRangeView | 'all'
}>(), { size: 'sm' })

const emit = defineEmits<{
  close: []
}>()

const { options } = useStatDateRangeOptions()

const items = computed(() => {
  const enabled = props.optionIds ? new Set(props.optionIds) : undefined
  const order = new Map(props.optionIds?.map((id, index) => [id, index]) ?? [])
  return options.value.filter((item) => {
    if ((props.view !== 'all' && item.view !== props.view) || (enabled && !enabled.has(item.id)))
      return false
    return item.view !== 'presets' || !props.presetUnit || item.range.rangeBy === props.presetUnit
  }).toSorted((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER))
})

const rangeTabItems = computed<TabsItem[]>(() => items.value.map(item => ({
  label: item.label,
  value: item.id,
})))

const selectedRangeKey = computed(() => items.value.find(item => item.view !== 'maximum'
  && item.range.rangeBy === props.statDate.params.value.rangeBy
  && item.range.rangeDuration === props.statDate.params.value.rangeDuration)?.id)

const selectedMaxRangeKey = computed(() => props.statDate.params.value.isShowMaxRange
  ? items.value.find(item => item.view === 'maximum' && item.isSkipEmpty === props.statDate.params.value.isSkipEmpty)?.id
  : undefined)
const selectedKey = computed(() => selectedMaxRangeKey.value ?? selectedRangeKey.value)

function onSelectRangeKey(key: string | number) {
  const item = items.value.find(option => option.id === key)
  if (!item)
    return
  if (item.view === 'maximum')
    props.statDate.setMaxRange(item.isSkipEmpty)
  else
    props.statDate.setRangeByPeriod({ ...item.range, label: item.label })
  emit('close')
}
</script>

<template>
  <div :class="props.vertical ? 'grid content-start gap-1' : 'flex shrink-0 items-center gap-1'">
    <UiTabs
      v-if="view === 'all' && rangeTabItems.length"
      :align="props.vertical ? 'left' : 'center'"
      :class="cn(props.vertical && 'flex-col overflow-visible', props.tabsClass)"
      :grow="!props.vertical"
      :itemClass="props.itemClass"
      :size
      :items="rangeTabItems"
      :modelValue="selectedKey"
      @update:modelValue="onSelectRangeKey"
    />

    <UiTabs
      v-if="(view === 'periods' || view === 'presets') && rangeTabItems.length"
      :align="props.vertical ? 'left' : 'center'"
      :class="cn(props.vertical && 'flex-col overflow-visible', props.tabsClass)"
      :grow="!props.vertical"
      :itemClass="props.itemClass"
      :size
      :items="rangeTabItems"
      :modelValue="selectedRangeKey"
      @update:modelValue="onSelectRangeKey"
    />

    <template v-if="props.isShowRangeAdjust">
      <UiInlineStepper
        :value="props.statDate.params.value.rangeDuration"
        @dec="props.statDate.minusRange"
        @inc="props.statDate.plusRange"
      />
    </template>

    <UiTabs
      v-if="props.view === 'maximum'"
      :align="props.vertical ? 'left' : 'center'"
      :class="cn(props.vertical && 'flex-col overflow-visible', props.tabsClass)"
      :grow="!props.vertical"
      :itemClass="props.itemClass"
      :size
      :items="rangeTabItems"
      :modelValue="selectedMaxRangeKey"
      @update:modelValue="onSelectRangeKey"
    />
  </div>
</template>
