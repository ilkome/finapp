<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'
import type { StatProvider } from '~/components/stat/useStat'
import { getStyles } from '~/components/ui/getStyles'

const filter = inject('filter') as FilterProvider
const stat = inject('stat') as StatProvider

const periodCounts = [1, 3, 6, 7, 12, 14, 16, 24, 30, 36, 48, 60]
</script>

<template>
  <div class="min-w-[280px] bg-item-4 grid gap-1 p-3 gap-12 overflow-hidden">
    <div class="grid gap-2 overflow-hidden">
      <UiTitle2>{{ $t("dates.period") }}</UiTitle2>

      <div>
        <div
          v-for="periodItem in filter.periodsNames.value"
          :key="periodItem.slug"
          :class="[
            { '!bg-item-3': filter.periodNameWithAll.value === periodItem.slug },
            ...getStyles('item', ['link', 'bg', 'rounded', 'padding1', 'minh2']),
          ]"
          class="flex gap-2 items-center"
          @click="filter.setPeriodAndDate(periodItem.slug)"
        >
          <div :class="periodItem.icon" />
          {{ $t(`dates.${periodItem.slug}.simple`) }}
        </div>

        <div
          :class="[
            { '!bg-item-3': filter.periodNameWithAll.value === 'all' },
            ...getStyles('item', ['link', 'bg', 'rounded', 'padding1', 'minh2']),
          ]"
          class="flex gap-2 items-center"
          @click="filter.setPeriodAndDate('all')"
        >
          <div class="mdi mdi-database" />
          {{ $t('dates.all.simple') }}
        </div>
      </div>
    </div>

    <StatChartOptions />

    <!-- Counts -->
    <div v-if="filter.periodNameWithAll.value !== 'all'" class="grid gap-2 overflow-hidden">
      <UiTitle2>
        {{ $t("dates.count") }}
      </UiTitle2>

      <div>
        <div
          v-for="periodCount in periodCounts"
          :key="periodCount"
          :class="[
            { '!bg-item-3': periodCount === filter.periods.value[filter.periodNameWithoutAll.value].showedPeriods },
            ...getStyles('item', ['link', 'bg', 'rounded', 'padding1', 'minh2']),
          ]"
          class="flex gap-2 items-center"
          @click="filter.setPeriod(periodCount)"
        >
          {{ periodCount }}
        </div>

        <div
          :class="[
            { '!bg-item-3': stat.filterPeriodMaxDateCount.value === filter.periods.value[filter.periodNameWithoutAll.value].showedPeriods },
            ...getStyles('item', ['link', 'bg', 'rounded', 'padding1', 'minh2']),
          ]"
          class="flex gap-2 items-center"
          @click="filter.setPeriod(stat.filterPeriodMaxDateCount.value)"
        >
          {{ stat.filterPeriodMaxDateCount.value }}
        </div>
      </div>
    </div>
  </div>
</template>
