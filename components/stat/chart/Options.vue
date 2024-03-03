<script setup lang="ts">
import { useChart } from '~/components/chart/useChart'
import { useFilter } from '~/components/filter/useFilter'
import useStatChart from '~/components/stat/useStatChart'

const { chartState, toggleChart } = useStatChart()
const { periodWithoutAll } = useFilter()
const { isShowDataLabels, toggleChartType } = useChart()
const { periods } = useChart()

const items = ref([{
  slug: 'income',
  icon: 'mdi mdi-arrow-down-thin-circle-outline',
  isActive: computed(() => chartState.show.income),
  event: () => toggleChart('income'),
}, {
  slug: 'expense',
  icon: 'mdi mdi-arrow-up-thin-circle-outline',
  isActive: computed(() => chartState.show.expense),
  event: () => toggleChart('expense'),
}, {
  slug: 'sum',
  icon: 'mdi mdi-chart-gantt',
  isActive: computed(() => chartState.show.sum),
  event: () => toggleChart('sum'),
}, {
  slug: 'charLabels',
  icon: 'mdi mdi-subtitles-outline',
  isActive: computed(() => isShowDataLabels.value),
  event: () => isShowDataLabels.value = !isShowDataLabels.value,
}, {
  slug: 'charType',
  icon: computed(() => periods.value[periodWithoutAll].type === 'line' ? 'mdi mdi-chart-line' : 'mdi mdi-chart-bar'),
  isActive: false,
  event: toggleChartType,
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
