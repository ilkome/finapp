<script setup lang="ts">
import type { IntervalRange } from "~/components/date/useIntervalRange";
import type { FullDuration, Interval, Range } from "~/components/date/types";
import dayjs from "dayjs";

const props = defineProps<{
  intervalRange: IntervalRange
  maxRange: Range;
}>();

const emit = defineEmits<{
  onClose: [];
  set7Days: [close: () => void];
  set7DaysMini: [close: () => void];
  set12Months: [close: () => void];
}>();

const { t } = useI18n();

function setAllData() {
  console.log('1111')
  props.intervalRange.viewConfig.value.isShowAll = true

  // TODO: intervalDuration
  const intervalDuration = dayjs(props.maxRange.end).diff(props.maxRange.start, 'day')

  props.intervalRange.setRangeByPeriod({
    grouped: { duration: 1, period: 'year' },
    interval: { duration: intervalDuration, period: 'day' },
  });
}

function set12Months(close: () => void) {
  emit("set12Months", close);

  props.intervalRange.viewConfig.value.isShowAll = false
  props.intervalRange.subtracted.value = 0

  props.intervalRange.setRangeByPeriod({
    grouped: { duration: 1, period: "month" },
    interval: { duration: 12, period: "month" },
  });
}

function close() {
  emit("onClose");
}
</script>

<template>
  <div>
    <div>
      <UiToggle2
        storageKey="finapp-date-modal-dev"
        :initStatus="true"
        :lineWidth="1"
        openPadding="!pb-6"
      >
        <template #header="{ toggle, isShown }">
          <UiTitle88 :isShown @click="toggle">Dev</UiTitle88>
        </template>

        <pre>{{ props.intervalRange }}</pre>
      </UiToggle2>

      <UiToggle2
        storageKey="finapp-date-modal-presets"
        :initStatus="true"
        :lineWidth="1"
        openPadding="!pb-6"
      >
        <template #header="{ toggle, isShown }">
          <UiTitle88 :isShown @click="toggle"> Presets </UiTitle88>
        </template>

        <UiTabs2 class="px-2">
          <DateLinkItem @click="emit('set7Days', close)"> 7 days </DateLinkItem>
          <DateLinkItem @click="emit('set7DaysMini', close)">
            7 days mini
          </DateLinkItem>
          <DateLinkItem @click="set12Months(close)"> 12 months </DateLinkItem>

          <DateLinkItem @click="setAllData"> all </DateLinkItem>
        </UiTabs2>
      </UiToggle2>

      <UiToggle2
        storageKey="finapp-date-modal-intervals"
        :initStatus="true"
        :lineWidth="1"
        openPadding="!pb-6"
      >
        <template #header="{ toggle, isShown }">
          <UiTitle88 :isShown @click="toggle"> Intervals </UiTitle88>
        </template>

        <div class="grid gap-2 px-2">
          <div class="flex flex-wrap gap-1">
            <DateRanges
              :interval="intervalRange.interval.value"
              :maxRange
              @setRange="intervalRange.setRange"
              @setRangeByPeriod="
                (d: FullDuration) => {
                  intervalRange.setRangeByPeriod(d);
                  close();
                }
              "
            />
          </div>

          <div class="flex flex-wrap gap-1">
            <DateRanges2
              :interval="intervalRange.interval.value"
              :maxRange
              @setRangeByPeriod="
                (d: FullDuration) => {
                  intervalRange.setRangeByPeriod(d);
                  close();
                }
              "
            />
          </div>

          <div class="flex gap-1">
            <DateLinkItem @click="intervalRange.minusRange"> - </DateLinkItem>

            <DateLinkItemNoBg>{{
              `Last ${intervalRange.interval.value.duration} ${intervalRange.interval.value.period}`
            }}</DateLinkItemNoBg>

            <DateLinkItem @click="intervalRange.plusRange"> + </DateLinkItem>
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
          <UiTitle88 :isShown @click="toggle"> Grouped by </UiTitle88>
        </template>

        <div class="grid gap-2 px-2">
          <div class="flex flex-wrap gap-1">
            <DateIntervals
              :grouped="intervalRange.grouped.value"
              @onSelect="
                (pd: Interval) => {
                  intervalRange.setGrouped(pd);
                  close();
                }
              "
            />
          </div>

          <div class="flex gap-1">
            <DateLinkItem @click="intervalRange.delInterval"> - </DateLinkItem>

            <DateLinkItem @click="intervalRange.addInterval"> + </DateLinkItem>
            <DateLinkItemNoBg>{{
              `${intervalRange.grouped.value.duration} ${intervalRange.grouped.value.period}`
            }}</DateLinkItemNoBg>
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
          <UiTitle88 :isShown @click="toggle"> Calendar </UiTitle88>
        </template>

        <template #default="{ close: closeToggle }">
          <DatePicker
            expanded
            color="blue"
            :value="intervalRange.range.value"
            @update:modelValue="
              (v: Range) => {
                intervalRange.setRange(v);
                closeToggle();
                close();
              }
            "
          />
        </template>
      </UiToggle2>
    </div>
  </div>
</template>
