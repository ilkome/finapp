<script setup lang="ts">
import dayjs from 'dayjs'
import { getStyles } from '~/components/ui/classes'
import type { PeriodProvider } from '~/components/dashboard/Page.vue'

const period = inject('period') as PeriodProvider
const filters = inject('filters')
const isToday = computed(() => dayjs().isSame(period.date.value, period.nameWithoutAll.value))
const isLastPeriod = computed(() => dayjs(period.date.value).isSame(filters.avaDate.value, period.nameWithoutAll.value))
</script>

<template>
  <div class="flex">
    <div
      :class="[...getStyles('item', ['link', 'rounded']), { 'opacity-30 !hocus_transparent': isToday }]"
      class="w-8"
      @click="period.setPrevPeriodDate"
    >
      <UiIconChevron class="size-8" />
    </div>

    <div
      :class="[...getStyles('item', ['link', 'rounded']), { 'opacity-30 !hocus_transparent': isLastPeriod }]"
      class="w-8"
      @click="period.setNextPeriodDate(filters.avaDate.value)"
    >
      <UiIconChevron class="size-8 rotate-180" />
    </div>

    <div
      v-if="!isToday"
      :class="getStyles('item', ['link', 'rounded'])"
      class="flex-center w-8"
      @click="period.setPeriodAndDate(period.nameWithoutAll.value)"
    >
      <UiIconReturn class="size-5" />
    </div>
  </div>
</template>
