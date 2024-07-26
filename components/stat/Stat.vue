<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'

const filter = useFilter()
const stat = useStat(filter)

provide('stat', stat)
provide('filter', filter)
</script>

<template>
  <div class="h-full overflow-hidden overflow-y-auto">
    <StatMini
      :categoriesIds="filter?.catsIds?.value"
      :isShowTotals="filter?.catsIds?.value?.length > 0 || filter?.walletsIds?.value?.length > 0"
      :walletsIds="filter?.walletsIds?.value"
      isShowFilter
      storageKey="stat"
    />
  </div>
</template>
