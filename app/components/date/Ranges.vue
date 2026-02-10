<script setup lang="ts">
import type { DateLinkItemProps } from '~/components/date/LinkItem.vue'
import type { IntervalGroupedLabel, StatDateProvider } from '~/components/date/types'

const props = defineProps<{
  isShowMaxRange?: boolean
  isShowRangeAdjust?: boolean
  itemProps?: Partial<DateLinkItemProps>
  statDate: StatDateProvider
  view: 'periods' | 'presets' | 'maximum'
}>()

const emit = defineEmits<{
  onClose: []
}>()

const { t } = useI18n()

const items = computed(() => {
  if (props.view === 'maximum')
    return false

  const elements: Record<Exclude<typeof props.view, 'maximum'>, IntervalGroupedLabel[]> = {
    periods: [{
      intervalsBy: 'day',
      intervalsDuration: 1,
      label: t('dates.day.simple'),
      rangeBy: 'day',
      rangeDuration: 1,
    }, {
      intervalsBy: 'day',
      intervalsDuration: 1,
      label: t('dates.week.simple'),
      rangeBy: 'week',
      rangeDuration: 1,
    }, {
      intervalsBy: 'day',
      intervalsDuration: 1,
      label: t('dates.month.simple'),
      rangeBy: 'month',
      rangeDuration: 1,
    }, {
      intervalsBy: 'month',
      intervalsDuration: 1,
      label: t('dates.year.simple'),
      rangeBy: 'year',
      rangeDuration: 1,
    }],

    presets: [{
      intervalsBy: 'day',
      intervalsDuration: 1,
      label: `7${t('dates.day.short')}`,
      rangeBy: 'day',
      rangeDuration: 7,
    }, {
      intervalsBy: 'day',
      intervalsDuration: 1,
      label: `14${t('dates.day.short')}`,
      rangeBy: 'day',
      rangeDuration: 14,
    }, {
      intervalsBy: 'day',
      intervalsDuration: 1,
      label: `30${t('dates.day.short')}`,
      rangeBy: 'day',
      rangeDuration: 30,
    }, {
      intervalsBy: 'week',
      intervalsDuration: 1,
      label: `3${t('dates.month.short')}`,
      rangeBy: 'month',
      rangeDuration: 3,
    }, {
      intervalsBy: 'month',
      intervalsDuration: 1,
      label: `6${t('dates.month.short')}`,
      rangeBy: 'month',
      rangeDuration: 6,
    }, {
      intervalsBy: 'month',
      intervalsDuration: 1,
      label: `12${t('dates.month.short')}`,
      rangeBy: 'month',
      rangeDuration: 12,
    }],
  }

  return elements[props.view]
})

function isRangeSelected(rd: IntervalGroupedLabel) {
  return rd.rangeDuration === props.statDate.params.value.rangeDuration && rd.rangeBy === props.statDate.params.value.rangeBy
}

function selectRange(igl: IntervalGroupedLabel) {
  props.statDate.setRangeByPeriod(igl)
  emit('onClose')
}

function selectMaxRange(isSkipEmpty = false) {
  props.statDate.setMaxRange(isSkipEmpty)
  emit('onClose')
}
</script>

<template>
  <div
    class="flex overflow-hidden"
    :class="{
      'gap-1': props.itemProps?.variant !== 'small',
    }"
  >
    <template v-if="(view === 'periods' || view === 'presets') && items">
      <DateLinkItem
        v-for="igl in items"
        v-bind="props.itemProps"
        :key="igl.label"
        :isActive="isRangeSelected(igl)"
        @click="selectRange(igl)"
      >
        {{ igl.label }}
      </DateLinkItem>
    </template>

    <template v-if="props.isShowRangeAdjust">
      <div class="border-default bg-default flex gap-1 rounded-sm border p-px">
        <DateLinkItem
          v-bind="props.itemProps"
          @click="props.statDate.minusRange"
        >
          -
        </DateLinkItem>
        <DateLinkItemNoBg>
          {{ props.statDate.params.value.rangeDuration }}
        </DateLinkItemNoBg>
        <DateLinkItem
          v-bind="props.itemProps"
          @click="props.statDate.plusRange"
        >
          +
        </DateLinkItem>
      </div>
    </template>

    <template v-if="props.view === 'maximum'">
      <DateLinkItem
        v-bind="props.itemProps"
        :isActive="props.statDate.params.value.isShowMaxRange && !props.statDate.params.value.isSkipEmpty"
        @click="selectMaxRange(false)"
      >
        {{ t('dates.ranges.all') }}
      </DateLinkItem>
      <DateLinkItem
        v-bind="props.itemProps"
        :isActive="props.statDate.params.value.isShowMaxRange && props.statDate.params.value.isSkipEmpty"
        @click="selectMaxRange(true)"
      >
        {{ t('dates.ranges.allSkipEmpty') }}
      </DateLinkItem>
    </template>
  </div>
</template>
