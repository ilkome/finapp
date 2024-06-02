<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'

const filter = useFilter()
const stat = useStat(filter)

filter.initChart()

provide('stat', stat)
provide('filter', filter)
</script>

<template>
  <div
    class="h-full overflow-hidden overflow-y-auto px-3 py-4 pb-6 sm_px-1 lg_max-w-6xl lg_px-3 lg_px-8 lg_py-6"
  >
    <StatMini
      :categoriesIds="filter?.catsIds?.value"
      :walletsIds="filter?.walletsIds?.value"
      isShowTotals
    />
  </div>
</template>
