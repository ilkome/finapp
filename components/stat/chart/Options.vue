<script setup lang="ts">
import type { PeriodProvider } from '~/components/dashboard/Page.vue'

const period = inject('period') as PeriodProvider

const items = ref([{
  slug: 'income',
  icon: 'mdi mdi-arrow-down-thin-circle-outline',
  isActive: computed(() => period.ui.value.income),
  event: () => period.ui.value.toggleUi('income'),
}, {
  slug: 'expense',
  icon: 'mdi mdi-arrow-up-thin-circle-outline',
  isActive: computed(() => period.ui.value.expense),
  event: () => period.ui.value.toggleUi('expense'),
}, {
  slug: 'sum',
  icon: 'mdi mdi-chart-gantt',
  isActive: computed(() => period.ui.value.sum),
  event: () => period.ui.value.toggleUi('sum'),
}, {
  slug: 'charLabels',
  icon: 'mdi mdi-subtitles-outline',
  isActive: computed(() => period.ui.value.isShowDataLabels),
  event: () => period.ui.value.toggleUi('isShowDataLabels'),
}, {
  slug: 'charType',
  icon: computed(() => period.periods.value[period.nameWithoutAll.value].type === 'line' ? 'mdi mdi-chart-line' : 'mdi mdi-chart-bar'),
  isActive: false,
  event: period.toggleChartType,
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
