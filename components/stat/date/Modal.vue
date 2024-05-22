<script setup lang="ts">
import type { PeriodNameWithAll, PeriodNameWithoutAll, Periods, PeriodsNames } from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  hide?: () => void
  periodNameWithAll: PeriodNameWithAll
  periods: Periods
  periodsNames: PeriodsNames
}>()

const emit = defineEmits<{
  setPeriodAndDate: [slug: PeriodNameWithoutAll]
}>()

function onClick(slug: PeriodNameWithoutAll) {
  if (props.hide)
    props.hide()

  emit('setPeriodAndDate', slug)
}
</script>

<template>
  <div class="min-w-[180px] bg-item-4 grid gap-1 p-2 overflow-hidden">
    <div
      v-for="periodItem in props.periodsNames"
      :key="periodItem.slug"
      :class="[
        { '!bg-item-6': props.periodNameWithAll === periodItem.slug },
        ...getStyles('item', ['link', 'rounded', 'padding1', 'minh2']),
      ]"
      class="flex gap-3 items-center"
      @click="onClick(periodItem.slug)"
    >
      <Icon :name="periodItem.icon" size="22" />
      <div class="text-sm">
        {{ $t(`dates.${periodItem.slug}.simple`) }}
        <!-- {{ props.periods[periodItem.slug].showedPeriods }} -->
      </div>
    </div>
  </div>
</template>
