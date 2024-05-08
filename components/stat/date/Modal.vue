<script setup lang="ts">
import type { FilterProvider, PeriodNameWithAll } from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  hide?: () => void
}>()

const filter = inject('filter') as FilterProvider

function onClick(slug: PeriodNameWithAll) {
  if (props.hide)
    props.hide()

  filter.setPeriodAndDate(slug)
}
</script>

<template>
  <div class="min-w-[180px] bg-item-4 grid gap-1 p-2 overflow-hidden">
    <div
      v-for="periodItem in filter.periodsNames.value"
      :key="periodItem.slug"
      :class="[
        { '!bg-item-6': filter.periodNameWithAll.value === periodItem.slug },
        ...getStyles('item', ['link', 'rounded', 'padding1', 'minh2']),
      ]"
      class="flex gap-3 items-center"
      @click="onClick(periodItem.slug)"
    >
      <div :class="periodItem.icon" class="text-xl" />
      <div class="text-sm">
        {{ $t(`dates.${periodItem.slug}.simple`) }}
        {{ filter.periods.value[periodItem.slug].showedPeriods }}
      </div>
    </div>
  </div>
</template>
