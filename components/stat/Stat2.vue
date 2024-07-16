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
    class="grid h-full pb-14 overflow-hidden"
  >
    <StatMini2
      :categoriesIds="filter?.catsIds?.value"
      :isShowTotals="filter?.catsIds?.value?.length > 0 || filter?.walletsIds?.value?.length > 0"
      :walletsIds="filter?.walletsIds?.value"
      isShowFilter
      storageKey="stat"
    />
  </div>
</template>
