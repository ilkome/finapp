<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { StatProvider } from '~/components/stat/useStat'
import type { FilterProvider } from '~/components/filter/useFilter'

const period = inject('filter') as FilterProvider
const stat = inject('stat') as StatProvider
</script>

<template>
  <div class="flex">
    <div
      :class="[...getStyles('item', ['link', 'rounded']), { 'opacity-30 !hocus_transparent': stat.isLastPeriod.value }]"
      class="w-8"
      @click="period.setNextPeriodDate(stat.avaDate.value)"
    >
      <UiIconChevron class="size-8" />
    </div>

    <div
      :class="[...getStyles('item', ['link', 'rounded']), { 'opacity-30 !hocus_transparent': stat.isToday.value }]"
      class="w-8"
      @click="period.setPrevPeriodDate"
    >
      <UiIconChevron class="size-8 rotate-180" />
    </div>

    <div
      v-if="!stat.isToday.value"
      :class="getStyles('item', ['link', 'rounded'])"
      class="flex-center w-8"
      @click="period.setPeriodAndDate(period.periodNameWithoutAll.value)"
    >
      <UiIconReturn class="size-5" />
    </div>
  </div>
</template>
