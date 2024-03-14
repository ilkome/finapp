<script setup lang="ts">
import { useChartStore } from '~/components/chart/useChartStore'
import { useFilter } from '~/components/filter/useFilter'

const filterStore = useFilter()
const chartStore = useChartStore()

const items = ref([{
  slug: 'income',
  icon: 'mdi mdi-arrow-down-thin-circle-outline',
  isActive: computed(() => chartStore.chart.income),
  event: () => chartStore.toggleChartVisibility('income'),
}, {
  slug: 'expense',
  icon: 'mdi mdi-arrow-up-thin-circle-outline',
  isActive: computed(() => chartStore.chart.expense),
  event: () => chartStore.toggleChartVisibility('expense'),
}, {
  slug: 'sum',
  icon: 'mdi mdi-chart-gantt',
  isActive: computed(() => chartStore.chart.sum),
  event: () => chartStore.toggleChartVisibility('sum'),
}, {
  slug: 'charLabels',
  icon: 'mdi mdi-subtitles-outline',
  isActive: computed(() => chartStore.isShowDataLabels),
  event: () => chartStore.isShowDataLabels = !chartStore.isShowDataLabels,
}, {
  slug: 'charType',
  icon: computed(() => chartStore.periods[filterStore.periodWithoutAll].type === 'line' ? 'mdi mdi-chart-line' : 'mdi mdi-chart-bar'),
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
