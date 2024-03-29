<script setup lang="ts">
import type { FiltersProvider, PeriodProvider } from '~/components/dashboard/Page.vue'

const period = inject('period') as PeriodProvider
const filters = inject('filters') as FiltersProvider

const showedPeriods = computed(
  () => period.periods.value[period.nameWithoutAll.value].showedPeriods,
)

function saveChartsPeriodsToLocalStorage() {
  localStorage.setItem('chartsPeriods', JSON.stringify(period.periods.value))
}

function addPeriod() {
  period.addPeriod()
  saveChartsPeriodsToLocalStorage()
}

function removePeriod() {
  if (showedPeriods.value <= 1)
    return

  period.removePeriod()
  saveChartsPeriodsToLocalStorage()
}

// TODO: duplicate computed
const isShowRemove = computed(() => showedPeriods.value <= 1)
const isShowAdd = computed(() => showedPeriods.value >= filters.filterPeriodMaxDateCount.value)
</script>

<template>
  <UiTabs2>
    <UiTabsItem2
      v-for="periodItem in period.periodsNames.value"
      :key="periodItem.slug"
      :isActive="periodItem.slug === period.nameWithoutAll.value"
      @click="period.setPeriodAndDate(periodItem.slug)"
    >
      {{ periodItem.name }}
      <sup v-if="periodItem.slug === period.nameWithoutAll.value" class="text-2xs -mr-2">
        {{ period.periods.value[period.nameWithoutAll.value].showedPeriods }}
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
