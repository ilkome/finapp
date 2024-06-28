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
    class="h-full overflow-hidden overflow-y-auto px-3 py-4 pb-6 sm:px-1 -lg:max-w-6xl lg:px-3 lg:px-8 lg:py-6"
  >
    <StatMini
      :categoriesIds="filter?.catsIds?.value"
      :isShowTotals="filter?.catsIds?.value?.length > 0 || filter?.walletsIds?.value?.length > 0"
      :walletsIds="filter?.walletsIds?.value"
      isShowFilter
      storageKey="stat"
    />
  </div>
</template>
