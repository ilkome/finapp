<script setup lang="ts">
import dayjs from 'dayjs'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { ViewOptions } from '~/components/stat/types'
import type { DeepPartial } from '~~/utils/types'

const props = defineProps<{
  maxRange: Range
}>()

const emit = defineEmits<{
  changeViewOptions: [o: DeepPartial<ViewOptions>]
  onClose: []

}>()

function close() {
  emit('onClose')
}

const statDate = inject('statDate') as StatDateProvider

const mini = {
  catsList: {
    isGrouped: false,
    isItemsBg: false,
    isLines: false,
    isRoundIcon: false,
  },
  catsRound: {
    isGrouped: false,
  },
}

const standard = {
  catsList: {
    isGrouped: true,
    isItemsBg: false,
    isLines: true,
    isOpened: false,
    isRoundIcon: true,
  },
  catsRound: {
    isGrouped: true,
  },
}

function set7Days() {
  emit('onClose')
  emit('changeViewOptions', {
    ...standard,
    catsView: 'list',
  })
  statDate.params.value.isShowMaxRange = false

  statDate.setRangeByPeriod({
    intervalsBy: 'day',
    intervalsDuration: 1,
    rangeBy: 'day',
    rangeDuration: 7,
  })

  if (close) {
    close()
  }
}

function set7DaysMini() {
  emit('onClose')
  emit('changeViewOptions', {
    ...mini,
    catsView: 'round',
  })

  statDate.params.value.isShowMaxRange = false

  statDate.setRangeByPeriod({
    intervalsBy: 'day',
    intervalsDuration: 1,
    rangeBy: 'day',
    rangeDuration: 7,
  })

  if (close) {
    close()
  }
}

function set30DaysMini() {
  emit('onClose')
  emit('changeViewOptions', {
    ...mini,
    catsView: 'round',
  })

  statDate.params.value.isShowMaxRange = false

  statDate.setRangeByPeriod({
    intervalsBy: 'day',
    intervalsDuration: 1,
    rangeBy: 'day',
    rangeDuration: 30,
  })

  if (close) {
    close()
  }
}

function set12Months() {
  emit('onClose')
  emit('changeViewOptions', {
    ...standard,
    catsView: 'list',
  })

  statDate.params.value.isShowMaxRange = false
  statDate.params.value.rangeOffset = 0

  statDate.setRangeByPeriod({
    intervalsBy: 'month',
    intervalsDuration: 1,
    rangeBy: 'month',
    rangeDuration: 12,
  })

  if (close) {
    close()
  }
}

function setMaxRange() {
  emit('onClose')
  emit('changeViewOptions', {
    ...standard,
    catsView: 'list',
  })
  statDate.setRangeByPeriod({
    intervalsBy: 'year',
    intervalsDuration: 1,
    isShowMaxRange: true,
    isSkipEmpty: false,
    rangeBy: 'day',
    rangeDuration: dayjs(props.maxRange.end).diff(props.maxRange.start, 'day'),
  })

  if (close) {
    close()
  }
}

function setMaxRangeHideLast() {
  emit('onClose')
  emit('changeViewOptions', {
    ...standard,
    catsView: 'list',
  })
  statDate.setRangeByPeriod({
    intervalsBy: 'year',
    intervalsDuration: 1,
    isShowMaxRange: true,
    isSkipEmpty: true,
    rangeBy: 'day',
    rangeDuration: dayjs(props.maxRange.end).diff(props.maxRange.start, 'day'),
  })

  if (close) {
    close()
  }
}
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
        <UiTitle81 :isShown @click="toggle">
          Presets
        </UiTitle81>
      </template>

      <div class="grid gap-4 px-2">
        <div class="flex flex-wrap gap-1">
          <DateRanges @close="close" />

          <div class="flex gap-1">
            <DateLinkItem @click="statDate.minusRange">
              -
            </DateLinkItem>

            <DateLinkItem @click="statDate.plusRange">
              +
            </DateLinkItem>
          </div>
        </div>

        <div class="flex flex-wrap gap-1">
          <DateLinkItem @click="set7Days">
            7 days
          </DateLinkItem>
          <DateLinkItem @click="set7DaysMini">
            7 days mini
          </DateLinkItem>
          <DateLinkItem @click="set30DaysMini">
            30 days mini
          </DateLinkItem>
          <DateLinkItem @click="set12Months">
            12 months
          </DateLinkItem>

          <DateLinkItem
            :isActive="statDate.params.value.isShowMaxRange && !statDate.params.value.isSkipEmpty"
            @click="setMaxRange"
          >
            All
          </DateLinkItem>

          <DateLinkItem
            :isActive="statDate.params.value.isShowMaxRange && statDate.params.value.isSkipEmpty"
            @click="setMaxRangeHideLast"
          >
            All skip empty
          </DateLinkItem>
        </div>
      </div>
    </UiToggle2>

    <UiToggle2
      storageKey="finapp-date-modal-intervals"
      :initStatus="true"
      :lineWidth="1"
      openPadding="!pb-6"
    >
      <template #header="{ toggle, isShown }">
        <UiTitle81 :isShown @click="toggle">
          Intervals
        </UiTitle81>
      </template>

      <div class="grid gap-2 px-2">
        <div class="flex flex-wrap gap-1">
          <DateRanges2 @close="close" />
        </div>

        <div class="flex flex-wrap gap-1">
          <DateLinkItem @click="statDate.minusRange">
            -
          </DateLinkItem>

          <DateLinkItemNoBg>
            {{
              `Last ${statDate.params.value.rangeDuration} ${statDate.params.value.rangeBy}`
            }}
          </DateLinkItemNoBg>

          <DateLinkItem @click="statDate.plusRange">
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
        <UiTitle81 :isShown @click="toggle">
          Grouped by
        </UiTitle81>
      </template>

      <div class="grid gap-2 px-2">
        <div class="flex flex-wrap gap-1">
          <DateIntervals @close="close" />
        </div>

        <div class="flex gap-1">
          <DateLinkItem @click="statDate.delInterval">
            -
          </DateLinkItem>

          <DateLinkItem @click="statDate.addInterval">
            +
          </DateLinkItem>
          <DateLinkItemNoBg>
            {{
              `${statDate.params.value.intervalsDuration} ${statDate.params.value.intervalsBy}`
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
        <UiTitle81 :isShown @click="toggle">
          Calendar
        </UiTitle81>
      </template>

      <DatePicker
        expanded
        color="blue"
        :value="statDate.range.value"
        @update:modelValue="
          (v: Range) => {
            statDate.setRangeByCalendar(v);
            close();
          }
        "
      />
    </UiToggle2>
  </div>
</template>
