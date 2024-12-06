<script setup lang="ts">
const props = defineProps<{
  series: {
    color: string
    cursor: string
    data: number[]
    markArea?: any
    name: string
    type: string
  }[]
  xAxisLabels: number[]
}>()
</script>

<template>
  <StatChartWrap
    :series="props.series"
    :xAxisLabels="props.xAxisLabels"
  />
</template>
