<script setup lang="ts">
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const statConfig = useStatConfigCtx()
const orderedOptionIds = computed(() => {
  const selected = new Set(statConfig.date.value.quickRangeIds)
  return statConfig.date.value.quickRangeOrderIds.filter(id => selected.has(id))
})
</script>

<template>
  <div class="-mx-2 scroll-strip flex min-w-0 snap-x snap-mandatory scroll-px-2 items-center overflow-x-auto px-2 py-px lg:-mx-4 lg:scroll-px-4 lg:px-4 2xl:-mx-8 2xl:scroll-px-8 2xl:px-8">
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
