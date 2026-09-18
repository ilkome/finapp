<script setup lang="ts">
import type { StatDateProvider } from '~/components/stat/date/types'
import type { QuickRangeOptionId, StatDateRangeOption, StatDateRangeView } from '~/components/stat/date/useRangeOptions'

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

function onSelect(item: StatDateRangeOption) {
  if (item.view === 'maximum')
    props.statDate.setMaxRange(item.isSkipEmpty)
  else
    props.statDate.setRangeByPeriod({ ...item.range, label: item.label })
  emit('close')
}
</script>

<template>
  <StatDateRangesView
    :isShowRangeAdjust="props.isShowRangeAdjust"
    :itemClass="props.itemClass"
    :optionIds="props.optionIds"
    :options
    :params="props.statDate.params.value"
    :presetUnit="props.presetUnit"
    :size="props.size"
    :tabsClass="props.tabsClass"
    :vertical="props.vertical"
    :view="props.view"
    @select="onSelect"
    @updateRangeDuration="props.statDate.setRangeDuration"
  />
</template>
