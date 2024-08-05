<script setup lang="ts">
import type { UseDateRange } from '~/components/date/useDateRange'
import type { FullDuration, Interval, Range } from '~/components/date/types'

defineProps<{
  intervalRange: UseDateRange
  maxRange: Range
}>()

const emit = defineEmits<{
  onClose: []
  set7Days: []
  set12Months: []
}>()

const { t } = useI18n()

function set7Days(close: () => void) {
  emit('set7Days')
  close()
}

function set12Months(close: () => void) {
  emit('set12Months')
  close()
}
</script>

<template>
  <BaseBottomSheet2
    isShow
    drugClassesCustom="bg-foreground-1 max-w-xl grid md:mb-12 max-h-[98dvh]"
    @closed="emit('onClose')"
  >
    <template #handler="{ close }">
      <BaseBottomSheetHandler />
      <BaseBottomSheetClose @onClick="close" />
    </template>

    <template #default="{ close }">
      <div class="scrollerBlock grid p-3 pb-4 overflow-hidden max-h-[98dvh] overflow-y-auto">
        <UiTitle9>{{ t('dates.select') }}</UiTitle9>

        <UiToggle
          storageKey="finapp-date-modal-presets"
          :initStatus="true"
          openPadding="!pb-3"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between md:max-w-md">
              <UiTitle8 :isShown @click="toggle">
                Presets
              </UiTitle8>
            </div>
          </template>

          <div class="flex gap-2 px-2">
            <DateLinkItem @click="set7Days(close)">
              7 days
            </DateLinkItem>
            <DateLinkItem @click="set12Months(close)">
              12 months
            </DateLinkItem>
          </div>
        </UiToggle>

        <UiToggle
          storageKey="finapp-date-modal-intervals"
          :initStatus="true"
          openPadding="!pb-3"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between md:max-w-md">
              <UiTitle8 :isShown @click="toggle">
                Intervals
              </UiTitle8>
            </div>
          </template>

          <div class="flex gap-2">
            <DateLinkItem @click="intervalRange.minusRange">
              -
            </DateLinkItem>

            <DateLinkItemNoBg>{{ `Last ${intervalRange.interval.value.duration} ${intervalRange.interval.value.period}` }}</DateLinkItemNoBg>

            <DateLinkItem @click="intervalRange.plusRange">
              +
            </DateLinkItem>
          </div>

          <div class="flex flex-wrap gap-2">
            <DateRanges
              :interval="intervalRange.interval.value"
              :maxRange
              @setRange="intervalRange.setRange"
              @setRangeByPeriod="(d: FullDuration) => { intervalRange.setRangeByPeriod(d); close() }"
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <DateRanges2
              :interval="intervalRange.interval.value"
              :maxRange
              @setRangeByPeriod="(d: FullDuration) => { intervalRange.setRangeByPeriod(d); close() }"
            />
          </div>
        </UiToggle>

        <UiToggle
          storageKey="finapp-date-modal-grouped"
          :initStatus="false"
          openPadding="!pb-3"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between md:max-w-md">
              <UiTitle8 :isShown @click="toggle">
                Grouped
              </UiTitle8>
            </div>
          </template>

          <div class="flex gap-2">
            <DateLinkItem @click="intervalRange.delInterval">
              -
            </DateLinkItem>

            <DateLinkItemNoBg>{{ `Grouped by ${intervalRange.grouped.value.duration} ${intervalRange.grouped.value.period}` }}</DateLinkItemNoBg>

            <DateLinkItem @click="intervalRange.addInterval">
              +
            </DateLinkItem>
          </div>

          <div class="flex flex-wrap gap-2">
            <DateIntervals
              :grouped="intervalRange.grouped.value"
              @onSelect="(pd: Interval) => { intervalRange.setGrouped(pd); close() }"
            />
          </div>
        </UiToggle>

        <UiToggle
          storageKey="finapp-date-modal-select"
          :initStatus="false"
          openPadding="!pb-3"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between md:max-w-md">
              <UiTitle8 :isShown @click="toggle">
                Calendar
              </UiTitle8>
            </div>
          </template>

          <template #default="{ close: closeToggle }">
            <DatePicker
              expanded
              color="blue"
              :value="intervalRange.range.value"
              @update:modelValue="(v: Range) => { intervalRange.setRange(v); closeToggle(); close() }"
            />
          </template>
        </UiToggle>
      </div>
    </template>
  </BaseBottomSheet2>
</template>
