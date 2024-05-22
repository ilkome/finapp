<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { PeriodNameWithAll } from '~/components/filter/useFilter'

const props = defineProps<{
  isLastPeriod: boolean
  isToday: boolean
  periodNameWithAll: PeriodNameWithAll
}>()

const emit = defineEmits<{
  setNextPeriodDate: []
  setPeriodAndDate: [slug: PeriodNameWithAll]
  setPrevPeriodDate: []
}>()
</script>

<template>
  <div class="flex gap-1">
    <div
      :class="[
        ...getStyles('item', ['link', 'rounded', 'minh2', 'center']),
        { '!hocus_transparent opacity-30': props.isLastPeriod },
      ]"
      class="w-8 bg-item-4"
      @click="emit('setNextPeriodDate')"
    >
      <UiIconChevron class="size-8" />
    </div>

    <div
      :class="[
        ...getStyles('item', ['link', 'rounded', 'minh2', 'center']),
        {
          '!hocus_transparent opacity-30': props.isToday,
        },
      ]"
      class="w-8 bg-item-4"
      @click="emit('setPrevPeriodDate')"
    >
      <UiIconChevron class="size-8 rotate-180" />
    </div>

    <div
      v-if="!props.isToday"
      :class="getStyles('item', ['link', 'rounded', 'minh2', 'center'])"
      class="flex-center w-8 bg-item-4"
      @click="emit('setPeriodAndDate', props.periodNameWithAll)"
    >
      <UiIconReturn class="size-5" />
    </div>
  </div>
</template>
