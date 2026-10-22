<script setup lang="ts">
import { afterNextPaint } from '~~/utils/afterNextPaint'

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
  /** `text`: plain labels sized to their text, for a capsule strip (the wallets currency filter). */
  variant?: 'flat' | 'text'
  vertical?: boolean
  view: StatDateRangeView | 'all'
}>(), { size: 'sm' })

const emit = defineEmits<{
  close: []
}>()

const { options } = useStatDateRangeOptions()

// The stat page recomputes in the task that applies a range, so the picked tab is shown from here
// and the range applied after it paints.
const pending = shallowRef<StatDateRangeOption>()
const shownParams = computed(() => {
  const params = props.statDate.params.value
  const item = pending.value
  if (!item)
    return params
  return item.view === 'maximum'
    ? { ...params, isShowMaxRange: true, isSkipEmpty: item.isSkipEmpty }
    : { ...params, isShowMaxRange: false, rangeBy: item.range.rangeBy, rangeDuration: item.range.rangeDuration }
})

function onSelect(item: StatDateRangeOption) {
  pending.value = item
  afterNextPaint(() => {
    if (pending.value !== item)
      return
    pending.value = undefined
    if (item.view === 'maximum')
      props.statDate.setMaxRange(item.isSkipEmpty)
    else
      props.statDate.setRangeByPeriod({ ...item.range, label: item.label })
    emit('close')
  })
}
</script>

<template>
  <StatDateRangesView
    :isShowRangeAdjust="props.isShowRangeAdjust"
    :itemClass="props.itemClass"
    :optionIds="props.optionIds"
    :options
    :params="shownParams"
    :presetUnit="props.presetUnit"
    :size="props.size"
    :tabsClass="props.tabsClass"
    :variant="props.variant"
    :vertical="props.vertical"
    :view="props.view"
    @select="onSelect"
    @updateRangeDuration="props.statDate.setRangeDuration"
  />
</template>
