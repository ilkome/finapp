<script setup lang="ts">
import '~/components/modal/styles/modalLinks.styl'
import type { FiltersProvider, PeriodProvider } from '~/components/dashboard/Page.vue'

const period = inject('period') as PeriodProvider
const filters = inject('filters') as FiltersProvider

const periodCounts = [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60]
</script>

<template>
  <div class="bg-item-4 grid p-3 grid-cols-2 place-items-start gap-12 overflow-hidden">
    <div class="grid gap-2 overflow-hidden">
      <!-- Periods -->
      <UiTitle2>
        {{ $t("dates.period") }}
      </UiTitle2>

      <div>
        <UiTabsItem3
          v-for="periodItem in period.periodsNames"
          :key="periodItem.slug"
          :isActive="period.nameWithAll.value === periodItem.slug"
          class="nowrap"
          @click="period.setPeriodAndDate(periodItem.slug)"
        >
          <div :class="periodItem.icon" />
          {{ $t(`dates.${periodItem.slug}.simple`) }}
        </UiTabsItem3>

        <UiTabsItem3
          :isActive="period.nameWithAll.value === 'all'"
          @click="period.setPeriodAndDate('all')"
        >
          <div class="mdi mdi-database" />
          {{ $t('dates.all.simple') }}
        </UiTabsItem3>
      </div>
    </div>

    <!-- Counts -->
    <div v-if="period.nameWithAll.value !== 'all'" class="grid gap-2 overflow-hidden">
      <UiTitle2>
        {{ $t("dates.count") }}
      </UiTitle2>

      <div>
        <UiTabsItem3
          v-for="periodCount in periodCounts"
          :key="periodCount"
          :isActive="periodCount === chartStore.periods[period.nameWithoutAll.value].showedPeriods"
          class="nowrap"
          @click="chartStore.setPeriod(periodCount)"
        >
          {{ periodCount }}
        </UiTabsItem3>

        <UiTabsItem3
          :isActive="filters.filterPeriodMaxDateCount.value === chartStore.periods[period.nameWithoutAll.value].showedPeriods"
          @click="chartStore.setPeriod(filters.filterPeriodMaxDateCount.value)"
        >
          {{ filters.filterPeriodMaxDateCount.value }}
        </UiTabsItem3>
      </div>
    </div>
  </div>
</template>
