<script setup lang="ts">
import { useChartStore } from '~/components/stat/chart/useChartStore'
import { useFilterStore } from '~/components/filter/useFilterStore'

const filterStore = useFilterStore()
const chartStore = useChartStore()

const items = ref([{
  slug: 'income',
  icon: 'mdi mdi-arrow-down-thin-circle-outline',
  isActive: computed(() => chartStore.ui.income),
  event: () => chartStore.toggleUi('income'),
}, {
  slug: 'expense',
  icon: 'mdi mdi-arrow-up-thin-circle-outline',
  isActive: computed(() => chartStore.ui.expense),
  event: () => chartStore.toggleUi('expense'),
}, {
  slug: 'sum',
  icon: 'mdi mdi-chart-gantt',
  isActive: computed(() => chartStore.ui.sum),
  event: () => chartStore.toggleUi('sum'),
}, {
  slug: 'charLabels',
  icon: 'mdi mdi-subtitles-outline',
  isActive: computed(() => chartStore.ui.isShowDataLabels),
  event: () => chartStore.toggleUi('isShowDataLabels'),
}, {
  slug: 'charType',
  icon: computed(() => chartStore.periods[filterStore.periodNameWithoutAll].type === 'line' ? 'mdi mdi-chart-line' : 'mdi mdi-chart-bar'),
  isActive: false,
  event: chartStore.toggleChartType,
}])
</script>

<template>
  <div class="flex-center">
    <StatChartOptionsItem
      v-for="item in items"
      :key="item.slug"
      :isActive="item.isActive"
      :icon="item.icon"
      @click="item.event"
    />
  </div>
</template>
