<script setup lang="ts">
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { useChartStore } from '~/components/stat/chart/useChartStore'
import type {
  PeriodNameWithAll,
  PeriodSchema,
} from '~/components/stat/chart/useChartStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import '~/components/modal/styles/modalLinks.styl'
import type { PeriodProvider } from '~/components/dashboard/Page.vue'

const period = inject('period') as PeriodProvider
const chartStore = useChartStore()
const trnsStore = useTrnsStore()

function onSelectPeriodName(periodName: PeriodNameWithAll) {
  period.setPeriodAndDate(periodName)
}

// TODO: duplicate computed
const maxPeriodsNumber = computed(() => getMaxPeriodsToShow(period.nameWithoutAll.value, trnsStore.oldestTrnDate))

const periodCounts = [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60]

function onSelectPeriodCount(
  number: PeriodSchema['showedPeriods'],
) {
  chartStore.setPeriod(number)
}
</script>

<template>
  <div class="grid _sm_grid-cols-2 gap-6 py-3 px-3 bg-item-4">
    <div class="grid gap-2 overflow-hidden">
      <!-- Periods -->
      <UiTitle2>
        {{ $t("dates.period") }}
      </UiTitle2>

      <UiTabs2>
        <UiTabsItem2
          v-for="periodItem in chartStore.periodsNames"
          :key="periodItem.slug"
          :isActive="period.nameWithAll.value === periodItem.slug"
          class="nowrap"
          @click="onSelectPeriodName(periodItem.slug)"
        >
          <div :class="periodItem.icon" />
          {{ $t(`dates.${periodItem.slug}.simple`) }}
        </UiTabsItem2>

        <UiTabsItem2
          :isActive="period.nameWithAll.value === 'all'"
          @click="onSelectPeriodName('all')"
        >
          <div class="mdi mdi-database" />
          {{ $t('dates.all.simple') }}
        </UiTabsItem2>
      </UiTabs2>
    </div>

    <!-- Counts -->
    <div v-if="period.nameWithAll.value !== 'all'" class="grid gap-2 overflow-hidden">
      <UiTitle2>
        {{ $t("dates.count") }}
      </UiTitle2>

      <UiTabs2>
        <UiTabsItem2
          v-for="periodCount in periodCounts"
          :key="periodCount"
          :isActive="periodCount === chartStore.periods[period.nameWithoutAll.value].showedPeriods"
          class="nowrap"
          @click="onSelectPeriodCount(periodCount)"
        >
          {{ periodCount }}
        </UiTabsItem2>

        <UiTabsItem2
          :isActive="maxPeriodsNumber === chartStore.periods[period.nameWithoutAll.value].showedPeriods"
          @click="onSelectPeriodCount(maxPeriodsNumber)"
        >
          {{ maxPeriodsNumber }}
        </UiTabsItem2>
      </UiTabs2>
    </div>
  </div>
</template>
