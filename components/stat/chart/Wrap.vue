<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import { useChart } from '~/components/chart/useChart'

const filterStore = useFilter()
const { periods } = useChart()
const chartType = computed(() => periods.value[filterStore.periodWithoutAll].type)
</script>

<template lang="pug">
.h-48
  LazyStatChartView2(:chartType="chartType")
</template>
