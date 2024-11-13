<script setup lang="ts">
import type { IntervalGroupedLabel, IntervalRangeProvider, Range } from '~/components/date/types'

const emit = defineEmits<{
  onClose: []
  set7Days: [close: () => void]
  set7DaysMini: [close: () => void]
  set12Months: [close: () => void]
  set30Days: [close: () => void]
  set30DaysMini: [close: () => void]
  setAllData: [close: () => void]
  setAllSkipEmpty: [close: () => void]
}>()

function close() {
  emit('onClose')
}

const intervalRange = inject('intervalRange') as IntervalRangeProvider
</script>

<template>
  <div>
    <UiToggle2
      storageKey="finapp-date-modal-presets"
      :initStatus="true"
      :lineWidth="1"
      openPadding="!pb-6"
    >
      <template #header="{ toggle, isShown }">
        <UiTitle88 :isShown @click="toggle">
          Presets
        </UiTitle88>
      </template>

      <UiTabs2 class="!gap-2 px-2">
        <DateLinkItem @click="emit('set7Days', close)">
          7 days
        </DateLinkItem>
        <DateLinkItem @click="emit('set7DaysMini', close)">
          7 days mini
        </DateLinkItem>
        <DateLinkItem @click="emit('set30DaysMini', close)">
          30 days mini
        </DateLinkItem>
        <DateLinkItem @click="emit('set12Months', close)">
          12 months
        </DateLinkItem>

        <DateLinkItem
          :isActive="intervalRange.params.value.isShowAll && !intervalRange.params.value.isSkipEmpty"
          @click="emit('setAllData', close)"
        >
          All
        </DateLinkItem>

        <DateLinkItem
          :isActive="intervalRange.params.value.isShowAll && intervalRange.params.value.isSkipEmpty"
          @click="emit('setAllSkipEmpty', close)"
        >
          All skip empty
        </DateLinkItem>
      </UiTabs2>
    </UiToggle2>

    <UiToggle2
      storageKey="finapp-date-modal-intervals"
      :initStatus="true"
      :lineWidth="1"
      openPadding="!pb-6"
    >
      <template #header="{ toggle, isShown }">
        <UiTitle88 :isShown @click="toggle">
          Intervals
        </UiTitle88>
      </template>

      <div class="grid gap-2 px-2">
        <div class="flex flex-wrap gap-1">
          <DateRanges @close="close" />
        </div>

        <div class="flex flex-wrap gap-1">
          <DateRanges2 @close="close" />
        </div>

        <div class="flex gap-1">
          <DateLinkItem @click="intervalRange.minusRange">
            -
          </DateLinkItem>

          <DateLinkItemNoBg>
            {{
              `Last ${intervalRange.params.value.intervalDuration} ${intervalRange.params.value.intervalPeriod}`
            }}
          </DateLinkItemNoBg>

          <DateLinkItem @click="intervalRange.plusRange">
            +
          </DateLinkItem>
        </div>
      </div>
    </UiToggle2>

    <UiToggle2
      storageKey="finapp-date-modal-grouped"
      :initStatus="false"
      :lineWidth="1"
      openPadding="!pb-6"
    >
      <template #header="{ toggle, isShown }">
        <UiTitle88 :isShown @click="toggle">
          Grouped by
        </UiTitle88>
      </template>

      <div class="grid gap-2 px-2">
        <div class="flex flex-wrap gap-1">
          <DateIntervals @close="close" />
        </div>

        <div class="flex gap-1">
          <DateLinkItem @click="intervalRange.delInterval">
            -
          </DateLinkItem>

          <DateLinkItem @click="intervalRange.addInterval">
            +
          </DateLinkItem>
          <DateLinkItemNoBg>
            {{
              `${intervalRange.params.value.groupedDuration} ${intervalRange.params.value.groupedBy}`
            }}
          </DateLinkItemNoBg>
        </div>
      </div>
    </UiToggle2>

    <UiToggle2
      storageKey="finapp-date-modal-select"
      :initStatus="false"
      :lineWidth="1"
      openPadding="!pb-6"
    >
      <template #header="{ toggle, isShown }">
        <UiTitle88 :isShown @click="toggle">
          Calendar
        </UiTitle88>
      </template>

      <DatePicker
        expanded
        color="blue"
        :value="intervalRange.range.value"
        @update:modelValue="
          (v: Range) => {
            intervalRange.setRangeByCalendar(v);
            close();
          }
        "
      />
    </UiToggle2>
  </div>
</template>
