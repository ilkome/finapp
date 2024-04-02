<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'
import type { FiltersProvider } from '~/components/stat/useStat'

const filter = inject('filter') as FilterProvider
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
          v-for="periodItem in filter.periodsNames.value"
          :key="periodItem.slug"
          :isActive="filter.nameWithAll.value === periodItem.slug"
          class="nowrap"
          @click="filter.setPeriodAndDate(periodItem.slug)"
        >
          <div :class="periodItem.icon" />
          {{ $t(`dates.${periodItem.slug}.simple`) }}
        </UiTabsItem3>

        <UiTabsItem3
          :isActive="filter.nameWithAll.value === 'all'"
          @click="filter.setPeriodAndDate('all')"
        >
          <div class="mdi mdi-database" />
          {{ $t('dates.all.simple') }}
        </UiTabsItem3>
      </div>
    </div>

    <!-- Counts -->
    <div v-if="filter.nameWithAll.value !== 'all'" class="grid gap-2 overflow-hidden">
      <UiTitle2>
        {{ $t("dates.count") }}
      </UiTitle2>

      <div>
        <UiTabsItem3
          v-for="periodCount in periodCounts"
          :key="periodCount"
          :isActive="periodCount === filter.periods.value[filter.nameWithoutAll.value].showedPeriods"
          class="nowrap"
          @click="filter.setPeriod(periodCount)"
        >
          {{ periodCount }}
        </UiTabsItem3>

        <UiTabsItem3
          :isActive="filters.filterPeriodMaxDateCount.value === filter.periods.value[filter.nameWithoutAll.value].showedPeriods"
          @click="filter.setPeriod(filters.filterPeriodMaxDateCount.value)"
        >
          {{ filters.filterPeriodMaxDateCount.value }}
        </UiTabsItem3>
      </div>
    </div>
  </div>
</template>
