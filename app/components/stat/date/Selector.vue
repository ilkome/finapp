<script setup lang="ts">
import { differenceInDays } from 'date-fns'
import type { DeepPartial } from '~~/utils/types'
import type { IntervalGroupedLabel, Range, StatDateProvider } from '~/components/date/types'
import { calculateBestIntervalsBy } from '~/components/date/utils'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'

const props = defineProps<{
  maxRange: Range
}>()

const emit = defineEmits<{
  onClose: []

}>()

function close() {
  emit('onClose')
}

const { t } = useI18n()
const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider

const tabs = {
  items: ref(['presets', 'calendar']),
  selected: ref('presets'),
}

const viewPresets: Record<'mini' | 'standard', Record<'catsList', DeepPartial<StatConfigProvider['config']['value']['catsList']>> & Record<'catsRound', DeepPartial<StatConfigProvider['config']['value']['catsRound']>>> = {
  mini: {
    catsList: {
      isGrouped: false,
      isItemsBg: false,
      isLines: false,
      isRoundIcon: false,
    },
    catsRound: {
      isGrouped: false,
    },
  },
  standard: {
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
  },
}

function setRangeWithOptions({
  catsView,
  intervalOptions,
  viewPreset,
}: {
  catsView: StatConfigProvider['config']['value']['catsView']
  intervalOptions: IntervalGroupedLabel
  viewPreset: typeof viewPresets.mini | typeof viewPresets.standard
}) {
  emit('onClose')

  statConfig.updateConfig('catsView', catsView)
  statConfig.updateConfig('catsList', {
    ...statConfig.config.value.catsList,
    ...viewPreset.catsList,
  })
  statConfig.updateConfig('catsRound', {
    ...statConfig.config.value.catsRound,
    ...viewPreset.catsRound,
  })

  statDate.params.value.isShowMaxRange = false
  statDate.setRangeByPeriod(intervalOptions)
}

// Preset functions
function setDaysMini(days: number) {
  setRangeWithOptions({
    catsView: 'round',
    intervalOptions: {
      intervalsBy: 'day',
      intervalsDuration: 1,
      rangeBy: 'day',
      rangeDuration: days,
    },
    viewPreset: viewPresets.mini,
  })
}

function set7Days() {
  setRangeWithOptions({
    catsView: 'list',
    intervalOptions: {
      intervalsBy: 'day',
      intervalsDuration: 1,
      rangeBy: 'day',
      rangeDuration: 7,
    },
    viewPreset: viewPresets.standard,
  })
}

function set12Months() {
  setRangeWithOptions({
    catsView: 'list',
    intervalOptions: {
      intervalsBy: 'month',
      intervalsDuration: 1,
      rangeBy: 'month',
      rangeDuration: 12,
    },
    viewPreset: viewPresets.standard,
  })
  statDate.params.value.rangeOffset = 0
}

function setMaxRange(isSkipEmpty = false) {
  emit('onClose')

  statConfig.updateConfig('catsList', {
    ...statConfig.config.value.catsList,
    ...viewPresets.standard.catsList,
  })
  statConfig.updateConfig('catsRound', {
    ...statConfig.config.value.catsRound,
    ...viewPresets.standard.catsRound,
  })
  const rangeDuration = differenceInDays(props.maxRange.end, props.maxRange.start)
  const intervalsBy = calculateBestIntervalsBy(props.maxRange)

  statDate.setRangeByPeriod({
    intervalsBy,
    intervalsDuration: 1,
    isShowMaxRange: true,
    isSkipEmpty,
    rangeBy: 'day',
    rangeDuration,
  })
}
</script>

<template>
  <div>
    <UiTabs1 class="mb-2">
      <UiTabsItem1
        v-for="tab in tabs.items.value"
        :key="tab"
        :title="t(tab)"
        :isActive="tabs.selected.value === tab"
        @click="tabs.selected.value = tab"
      >
        {{ t(tab) }}
      </UiTabsItem1>
    </UiTabs1>

    <div v-if="tabs.selected.value === 'presets'">
      <div class="pb-6 pt-2">
        <!-- Presets -->
        <div class="grid gap-3">
          <div class="flex flex-wrap gap-1">
            <DateRanges />

            <div class="flex">
              <DateLinkItem @click="statDate.minusRange">
                -
              </DateLinkItem>
              <DateLinkItemNoBg>
                {{ statDate.params.value.rangeDuration }}
              </DateLinkItemNoBg>
              <DateLinkItem @click="statDate.plusRange">
                +
              </DateLinkItem>
            </div>
          </div>

          <div class="flex flex-wrap gap-1">
            <DateLinkItem @click="set7Days">
              {{ t('7Days') }}
            </DateLinkItem>
            <DateLinkItem @click="setDaysMini(7)">
              {{ t('7DaysMini') }}
            </DateLinkItem>
            <DateLinkItem @click="setDaysMini(14)">
              {{ t('14DaysMini') }}
            </DateLinkItem>
            <DateLinkItem @click="setDaysMini(30)">
              {{ t('30DaysMini') }}
            </DateLinkItem>
            <DateLinkItem @click="set12Months">
              {{ t('12Months') }}
            </DateLinkItem>

            <DateLinkItem
              :isActive="statDate.params.value.isShowMaxRange && !statDate.params.value.isSkipEmpty"
              @click="() => setMaxRange(false)"
            >
              {{ t('all') }}
            </DateLinkItem>

            <DateLinkItem
              :isActive="statDate.params.value.isShowMaxRange && statDate.params.value.isSkipEmpty"
              @click="() => setMaxRange(true)"
            >
              {{ t('allSkipEmpty') }}
            </DateLinkItem>
          </div>
        </div>
      </div>

      <!-- Ranges -->
      <UiToggle2
        storageKey="finapp-date-modal-intervals"
        :initStatus="true"
        :lineWidth="1"
        openPadding="!pb-6"
      >
        <template #header="{ toggle, isShown }">
          <UiTitle81 :isShown @click="toggle">
            {{ t('ranges') }}
          </UiTitle81>
        </template>

        <div class="flex flex-wrap gap-1 px-2">
          <DateRanges2 @close="close" />
        </div>
      </UiToggle2>

      <!-- Grouped by -->
      <UiToggle2
        storageKey="finapp-date-modal-grouped"
        :initStatus="false"
        :lineWidth="1"
        openPadding="!pb-6"
      >
        <template #header="{ toggle, isShown }">
          <UiTitle81 :isShown @click="toggle">
            {{ t('intervalsGrouped') }}
          </UiTitle81>
        </template>

        <div class="grid gap-2 px-2">
          <div class="flex flex-wrap gap-1">
            <DateIntervals />
          </div>

          <div class="flex gap-1">
            <DateLinkItem @click="statDate.delInterval">
              -
            </DateLinkItem>
            <DateLinkItemNoBg>
              {{
                `${statDate.params.value.intervalsDuration} ${t(`dates.${statDate.params.value.intervalsBy}.simple`)}`
              }}
            </DateLinkItemNoBg>
            <DateLinkItem @click="statDate.addInterval">
              +
            </DateLinkItem>
          </div>
        </div>
      </UiToggle2>
    </div>

    <DatePicker
      v-if="tabs.selected.value === 'calendar'"
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
  </div>
</template>

<i18n lang="yaml">
en:
  all: All
  allSkipEmpty: Maximum
  calendar: Calendar
  intervalsGrouped: Grouped by
  ranges: Ranges
  presets: Presets
  last: Last
  7Days: 7 days
  7DaysMini: 7 days mini
  14DaysMini: 14 days mini
  30DaysMini: 30 days mini
  12Months: 12 months

ru:
  all: Все
  allSkipEmpty: Максимально
  calendar: Календарь
  intervalsGrouped: Группировка по
  ranges: Диапазоны
  presets: Пресеты
  last: Последние
  7Days: 7 дней
  7DaysMini: 7 дней мини
  14DaysMini: 14 дней мини
  30DaysMini: 30 дней мини
  12Months: 12 месяцев
</i18n>
