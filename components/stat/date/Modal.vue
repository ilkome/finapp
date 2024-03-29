<script setup lang="ts">
import { useChartStore } from '~/components/stat/chart/useChartStore'
import '~/components/modal/styles/modalLinks.styl'
import type { FiltersProvider, PeriodProvider } from '~/components/dashboard/Page.vue'

const period = inject('period') as PeriodProvider
const filters = inject('filters') as FiltersProvider
const chartStore = useChartStore()

const periodCounts = [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60]
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
          @click="period.setPeriodAndDate(periodItem.slug)"
        >
          <div :class="periodItem.icon" />
          {{ $t(`dates.${periodItem.slug}.simple`) }}
        </UiTabsItem2>

        <UiTabsItem2
          :isActive="period.nameWithAll.value === 'all'"
          @click="period.setPeriodAndDate('all')"
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
          @click="chartStore.setPeriod(periodCount)"
        >
          {{ periodCount }}
        </UiTabsItem2>

        <UiTabsItem2
          :isActive="filters.filterPeriodMaxDateCount.value === chartStore.periods[period.nameWithoutAll.value].showedPeriods"
          @click="chartStore.setPeriod(filters.filterPeriodMaxDateCount.value)"
        >
          {{ filters.filterPeriodMaxDateCount.value }}
        </UiTabsItem2>
      </UiTabs2>
    </div>
  </div>
</template>
