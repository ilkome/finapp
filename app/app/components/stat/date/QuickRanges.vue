<script setup lang="ts">
import { statConfigKey, statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
const orderedOptionIds = computed(() => {
  const selected = new Set(statConfig.config.value.date.quickRangeIds)
  return statConfig.config.value.date.quickRangeOrderIds.filter(id => selected.has(id))
})
</script>

<template>
  <div class="stat-date-quick-ranges -mx-2 flex min-w-0 snap-x snap-mandatory scroll-px-2 items-center overflow-x-auto px-2 py-px lg:-mx-4 lg:scroll-px-4 lg:px-4 2xl:-mx-8 2xl:scroll-px-8 2xl:px-8">
    <StatDateRanges
      class="shrink-0"
      itemClass="snap-start snap-always"
      size="xs"
      :optionIds="orderedOptionIds"
      :statDate
      tabsClass="overflow-visible! bg-transparent! p-0!"
      view="all"
    />
  </div>
</template>

<style scoped>
.stat-date-quick-ranges {
  scrollbar-width: none;
}

.stat-date-quick-ranges::-webkit-scrollbar {
  display: none;
}
</style>
