<script setup lang="ts">
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { useChartStore } from '~/components/stat/chart/useChartStore'
import type {
  PeriodNameWithAll,
  PeriodNameWithoutAll,
  PeriodSchema,
} from '~/components/stat/chart/useChartStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import '~/components/modal/styles/modalLinks.styl'

const props = defineProps<{
  hide?: () => void
}>()
const periodNameWithAll = inject('periodNameWithAll') as Ref<PeriodNameWithAll>
const periodNameWithoutAll = inject('periodNameWithoutAll') as Ref<PeriodNameWithoutAll>
const setPeriodAndDate = inject('setPeriodAndDate') as (period: PeriodNameWithAll) => void

const chartStore = useChartStore()
const trnsStore = useTrnsStore()

function onSelectPeriodName(periodName: PeriodNameWithAll) {
  // props.hide && props.hide()
  setPeriodAndDate(periodName)
}

// TODO: duplicate computed
const maxPeriodsNumber = computed(() => getMaxPeriodsToShow(periodNameWithoutAll.value, trnsStore.oldestTrnDate))

const periodCounts = [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60]

function onSelectPeriodCount(
  number: PeriodSchema['showedPeriods'],
) {
  // props.hide && props.hide()
  chartStore.setPeriod(number)
}
</script>

<template>
  <div class="grid _sm_grid-cols-2 gap-6 py-3 px-3 bg-item-6">
    <div class="grid gap-2 overflow-hidden">
      <!-- Periods -->
      <UiTitle2>
        {{ $t("dates.period") }}
      </UiTitle2>

      <UiTabs2>
        <UiTabsItem2
          v-for="periodItem in chartStore.periodsNames"
          :key="periodItem.slug"
          :isActive="periodNameWithAll === periodItem.slug"
          class="nowrap"
          @click="onSelectPeriodName(periodItem.slug)"
        >
          <div :class="periodItem.icon" />
          {{ $t(`dates.${periodItem.slug}.simple`) }}
        </UiTabsItem2>

        <UiTabsItem2
          :isActive="periodNameWithAll === 'all'"
          @click="onSelectPeriodName('all')"
        >
          <div class="mdi mdi-database" />
          {{ $t('dates.all.simple') }}
        </UiTabsItem2>
      </UiTabs2>
    </div>

    <!-- Counts -->
    <div v-if="periodNameWithAll !== 'all'" class="grid gap-2 overflow-hidden">
      <UiTitle2>
        {{ $t("dates.count") }}
      </UiTitle2>

      <UiTabs2>
        <UiTabsItem2
          v-for="periodCount in periodCounts"
          :key="periodCount"
          :isActive="periodCount === chartStore.periods[periodNameWithoutAll].showedPeriods"
          class="nowrap"
          @click="onSelectPeriodCount(periodCount)"
        >
          {{ periodCount }}
        </UiTabsItem2>

        <UiTabsItem2
          :isActive="maxPeriodsNumber === chartStore.periods[periodNameWithoutAll].showedPeriods"
          @click="onSelectPeriodCount(maxPeriodsNumber)"
        >
          {{ maxPeriodsNumber }}
        </UiTabsItem2>
      </UiTabs2>
    </div>
  </div>
</template>
