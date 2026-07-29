<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { IntervalGroupedLabel, StatDateProvider } from '~/components/stat/date/types'

const props = withDefaults(defineProps<{
  isShowRangeAdjust?: boolean
  size?: 'md' | 'sm' | 'xs'
  statDate: StatDateProvider
  view: 'periods' | 'presets' | 'maximum'
}>(), { size: 'sm' })

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const items = computed(() => {
  if (props.view === 'maximum')
    return undefined

  const elements: Record<Exclude<typeof props.view, 'maximum'>, IntervalGroupedLabel[]> = {
    periods: [{
      granularityBy: 'day',
      granularityDuration: 1,
      label: t('dates.day.simple'),
      rangeBy: 'day',
      rangeDuration: 1,
    }, {
      granularityBy: 'day',
      granularityDuration: 1,
      label: t('dates.week.simple'),
      rangeBy: 'week',
      rangeDuration: 1,
    }, {
      granularityBy: 'day',
      granularityDuration: 1,
      label: t('dates.month.simple'),
      rangeBy: 'month',
      rangeDuration: 1,
    }, {
      granularityBy: 'month',
      granularityDuration: 1,
      label: t('dates.year.simple'),
      rangeBy: 'year',
      rangeDuration: 1,
    }],

    presets: [{
      granularityBy: 'day',
      granularityDuration: 1,
      label: `7${t('dates.day.short')}`,
      rangeBy: 'day',
      rangeDuration: 7,
    }, {
      granularityBy: 'day',
      granularityDuration: 1,
      label: `14${t('dates.day.short')}`,
      rangeBy: 'day',
      rangeDuration: 14,
    }, {
      granularityBy: 'day',
      granularityDuration: 1,
      label: `30${t('dates.day.short')}`,
      rangeBy: 'day',
      rangeDuration: 30,
    }, {
      granularityBy: 'week',
      granularityDuration: 1,
      label: `3${t('dates.month.short')}`,
      rangeBy: 'month',
      rangeDuration: 3,
    }, {
      granularityBy: 'month',
      granularityDuration: 1,
      label: `6${t('dates.month.short')}`,
      rangeBy: 'month',
      rangeDuration: 6,
    }, {
      granularityBy: 'month',
      granularityDuration: 1,
      label: `12${t('dates.month.short')}`,
      rangeBy: 'month',
      rangeDuration: 12,
    }],
  }

  return elements[props.view]
})

function keyOf(igl: IntervalGroupedLabel) {
  return `${igl.rangeBy}-${igl.rangeDuration}`
}

const rangeTabItems = computed<TabsItem[]>(() => (items.value ?? []).map(igl => ({
  label: igl.label,
  value: keyOf(igl),
})))

const selectedRangeKey = computed(() => `${props.statDate.params.value.rangeBy}-${props.statDate.params.value.rangeDuration}`)

function selectRange(igl: IntervalGroupedLabel) {
  props.statDate.setRangeByPeriod(igl)
  emit('close')
}

function onSelectRangeKey(key: string | number) {
  const igl = (items.value ?? []).find(i => keyOf(i) === key)
  if (igl)
    selectRange(igl)
}

function selectMaxRange(isSkipEmpty = false) {
  props.statDate.setMaxRange(isSkipEmpty)
  emit('close')
}

const maxRangeItems = computed<TabsItem[]>(() => [
  { label: t('dates.ranges.all'), value: 'all' },
  { label: t('dates.ranges.allSkipEmpty'), value: 'allSkipEmpty' },
])

const selectedMaxRangeKey = computed(() => props.statDate.params.value.isShowMaxRange
  ? (props.statDate.params.value.isSkipEmpty ? 'allSkipEmpty' : 'all')
  : undefined)

function onSelectMaxRangeKey(key: string | number) {
  selectMaxRange(key === 'allSkipEmpty')
}
</script>

<template>
  <div class="flex shrink-0 items-center gap-1">
    <UiTabs
      v-if="(view === 'periods' || view === 'presets') && rangeTabItems.length"
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
      :size
      :items="maxRangeItems"
      :modelValue="selectedMaxRangeKey"
      @update:modelValue="onSelectMaxRangeKey"
    />
  </div>
</template>
