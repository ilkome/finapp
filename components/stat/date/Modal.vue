<script setup lang="ts">
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { getOldestTrnDate } from '~/components/trns/helpers'
import { useChartStore } from '~/components/chart/useChartStore'
import type {
  PeriodName,
  PeriodNameWithAll,
  PeriodSchema,
} from '~/components/chart/useChartStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import '~/components/modal/styles/modalLinks.styl'

const props = defineProps<{
  hide?: () => void
}>()
const period = inject('period') as Ref<PeriodNameWithAll>
const periodWithoutAll = inject('periodWithoutAll') as Ref<PeriodName>
const setPeriodAndDate = inject('setPeriodAndDate') as (period: PeriodNameWithAll) => void

const chartStore = useChartStore()
const trnsStore = useTrnsStore()

function onSelectPeriodName(periodName: PeriodNameWithAll) {
  props.hide && props.hide()
  setPeriodAndDate(periodName)
}

// TODO: duplicate computed
const maxPeriodsNumber = computed(() => {
  const trnsItems = trnsStore.items
  const oldestTrnDate = getOldestTrnDate(trnsItems)
  return getMaxPeriodsToShow(periodWithoutAll.value, oldestTrnDate)
})

const periodCounts = [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60]

function onSelectPeriodCount(
  number: PeriodSchema['showedPeriods'],
) {
  props.hide && props.hide()
  chartStore.setElementsToChart(number)
}
</script>

<template>
  <div class="grid gap-6 py-3 px-3 bg-item-6">
    <div class="grid gap-2 overflow-hidden">
      <!-- Periods -->
      <UiTitle2>
        {{ $t("dates.period") }}
      </UiTitle2>

      <UiTabs2>
        <UiTabsItem2
          v-for="periodItem in chartStore.periodsNames"
          :key="periodItem.slug"
          :isActive="period === periodItem.slug"
          class="nowrap"
          @click="onSelectPeriodName(periodItem.slug)"
        >
          <div :class="periodItem.icon" />
          {{ $t(`dates.${periodItem.slug}.simple`) }}
        </UiTabsItem2>

        <UiTabsItem2
          :isActive="period === 'all'"
          @click="onSelectPeriodName('all')"
        >
          <div class="mdi mdi-database" />
          {{ $t('dates.all.simple') }}
        </UiTabsItem2>
      </UiTabs2>
    </div>

    <!-- Counts -->
    <div v-if="period !== 'all'" class="grid gap-2 overflow-hidden">
      <UiTitle2>
        {{ $t("dates.count") }}
      </UiTitle2>

      <UiTabs2>
        <UiTabsItem2
          v-for="periodCount in periodCounts"
          :key="periodCount"
          :isActive="periodCount === chartStore.periods[periodWithoutAll].showedPeriods"
          class="nowrap"
          @click="onSelectPeriodCount(periodCount)"
        >
          {{ periodCount }}
        </UiTabsItem2>

        <UiTabsItem2
          :isActive="maxPeriodsNumber === chartStore.periods[periodWithoutAll].showedPeriods"
          @click="onSelectPeriodCount(maxPeriodsNumber)"
        >
          {{ maxPeriodsNumber }}
        </UiTabsItem2>
      </UiTabs2>
    </div>
  </div>
</template>
