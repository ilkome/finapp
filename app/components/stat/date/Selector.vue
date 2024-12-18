<script setup lang="ts">
import { differenceInDays } from 'date-fns'
import type { DeepPartial } from '~~/utils/types'
import type { Grouped, IntervalGroupedLabel, Range, StatDateProvider } from '~/components/date/types'
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
      isGrouped: !statConfig.config.value.isCategoryPage,
      // isItemsBg: false,
      // isLines: false,
      // isRoundIcon: false,
    },
    catsRound: {
      isGrouped: !statConfig.config.value.isCategoryPage,
    },
  },
  standard: {
    catsList: {
      isGrouped: !statConfig.config.value.isCategoryPage,
      // isItemsBg: false,
      // isLines: true,
      // isOpened: false,
      // isRoundIcon: true,
    },
    catsRound: {
      isGrouped: !statConfig.config.value.isCategoryPage,
    },
  },
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

const intervals = computed<Grouped[]>(() => [{
  intervalsBy: 'day',
  intervalsDuration: 1,
}, {
  intervalsBy: 'week',
  intervalsDuration: 1,
}, {
  intervalsBy: 'month',
  intervalsDuration: 1,
}, {
  intervalsBy: 'year',
  intervalsDuration: 1,
}])

function selectInterval(grouped: Grouped) {
  statDate.setInterval(grouped)
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
      <div class="py-2 pb-4">
        <!-- Presets -->
        <div class="grid gap-2">
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
            <DateRanges2 />
          </div>

          <div class="flex flex-wrap gap-1">
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

      <!-- Grouped by -->
      <UiToggle2
        storageKey="finapp-date-modal-grouped"
        :initStatus="false"
        :lineWidth="1"
      >
        <template #header="{ toggle, isShown }">
          <UiTitle81 :isShown @click="toggle">
            {{ t('intervalsGrouped') }}
          </UiTitle81>
        </template>

        <div class="grid gap-2 px-2">
          <div class="flex flex-wrap gap-1">
            <DateLinkItem
              v-for="item in intervals"
              :key="item.intervalsBy"
              :isActive="item.intervalsBy === statDate.params.value.intervalsBy"
              @click="selectInterval(item)"
            >
              {{ t(`dates.${item.intervalsBy}.simple`) }}
            </DateLinkItem>
            <div class="flex">
              <DateLinkItem @click="statDate.delInterval">
                -
              </DateLinkItem>
              <DateLinkItemNoBg>
                {{ statDate.params.value.intervalsDuration }}
              </DateLinkItemNoBg>
              <DateLinkItem @click="statDate.addInterval">
                +
              </DateLinkItem>
            </div>
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
  7Days: 7d
  14Days: 14d
  30Days: 30d
  12Months: 12m
  mini: mini

ru:
  all: Все
  allSkipEmpty: Максимально
  calendar: Календарь
  intervalsGrouped: Группировка по
  ranges: Диапазоны
  presets: Пресеты
  last: Последние
  7Days: 7д
  14Days: 14д
  30Days: 30д
  12Months: 12м
  mini: мини
</i18n>
