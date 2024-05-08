<script setup lang="ts">
import type { FilterProvider } from '~/components/filter/useFilter'

const filter = inject('filter') as FilterProvider

const items = ref([{
//   slug: 'income',
//   icon: 'mdi mdi-arrow-down-thin-circle-outline',
//   isActive: computed(() => filter.ui.value.income),
//   event: () => filter.ui.value.toggleUi('income'),
// }, {
//   slug: 'expense',
//   icon: 'mdi mdi-arrow-up-thin-circle-outline',
//   isActive: computed(() => filter.ui.value.expense),
//   event: () => filter.ui.value.toggleUi('expense'),
// }, {
//   slug: 'sum',
//   icon: 'mdi mdi-chart-gantt',
//   isActive: computed(() => filter.ui.value.sum),
//   event: () => filter.ui.value.toggleUi('sum'),
  event: () => filter.ui.value.toggleUi('isShowDataLabels'),
  icon: 'mdi mdi-subtitles-outline',
  isActive: computed(() => filter.ui.value.isShowDataLabels),
  // }, {
  slug: 'charLabels',
}, {
  event: filter.toggleChartType,
  icon: computed(() => filter.periods.value[filter.periodNameWithoutAll.value].type === 'line' ? 'mdi mdi-chart-line' : 'mdi mdi-chart-bar'),
  isActive: false,
  slug: 'charType',
}])
</script>

<template>
  <div class="flex">
    <StatChartOptionsItem
      v-for="item in items"
      :key="item.slug"
      :isActive="item.isActive"
      :icon="item.icon"
      @click="item.event"
    />
  </div>
</template>
