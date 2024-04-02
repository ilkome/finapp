<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'
import type { FiltersProvider } from '~/components/stat/useStat'

const filter = inject('filter') as FilterProvider
const filters = inject('filters') as FiltersProvider

const showedPeriods = computed(
  () => filter.periods.value[filter.nameWithoutAll.value].showedPeriods,
)

function saveChartsPeriodsToLocalStorage() {
  localStorage.setItem('chartsPeriods', JSON.stringify(filter.periods.value))
}

function addPeriod() {
  filter.addPeriod()
  saveChartsPeriodsToLocalStorage()
}

function removePeriod() {
  if (showedPeriods.value <= 1)
    return

  filter.removePeriod()
  saveChartsPeriodsToLocalStorage()
}

// TODO: duplicate computed
const isShowRemove = computed(() => showedPeriods.value <= 1)
const isShowAdd = computed(() => showedPeriods.value >= filters.filterPeriodMaxDateCount.value)
</script>

<template>
  <UiTabs2>
    <UiTabsItem2
      v-for="periodItem in filter.periodsNames.value"
      :key="periodItem.slug"
      :isActive="periodItem.slug === filter.nameWithoutAll.value"
      @click="filter.setPeriodAndDate(periodItem.slug)"
    >
      {{ periodItem.name }}
      <sup v-if="periodItem.slug === filter.nameWithoutAll.value" class="text-2xs -mr-2">
        {{ filter.periods.value[filter.nameWithoutAll.value].showedPeriods }}
      </sup>
    </UiTabsItem2>

    <UiTabsItem2
      :isActive="isShowRemove"
      @click="removePeriod()"
    >
      <i class="mdi mdi-minus" />
    </UiTabsItem2>

    <UiTabsItem2
      :isActive="isShowAdd"
      @click="addPeriod()"
    >
      <i class="mdi mdi-plus" />
    </UiTabsItem2>
  </UiTabs2>
</template>
