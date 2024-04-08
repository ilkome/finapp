<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'
import type { StatProvider } from '~/components/stat/useStat'

const filter = inject('filter') as FilterProvider
const stat = inject('stat') as StatProvider

const showedPeriods = computed(
  () => filter.periods.value[filter.periodNameWithoutAll.value].showedPeriods,
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
const isShowAdd = computed(() => showedPeriods.value >= stat.filterPeriodMaxDateCount.value)
</script>

<template>
  <UiTabs2 class="gap-1">
    <UiTabsItem2
      v-for="periodItem in filter.periodsNames.value"
      :key="periodItem.slug"
      :isActive="periodItem.slug === filter.periodNameWithoutAll.value"
      @click="filter.setPeriodAndDate(periodItem.slug)"
    >
      {{ periodItem.name }}
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
