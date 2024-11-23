<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  isLastPeriod: boolean
  isToday: boolean
}>()

const emit = defineEmits<{
  changeDate: [action: 'prev' | 'next' | 'today']
}>()
</script>

<template>
  <div class="flex gap-1">
    <div
      v-if="!props.isToday"
      :class="[getStyles('item', ['link', 'rounded', 'minh2'])]"
      class="font-primary flex items-center text-nowrap px-3 py-2 text-base font-medium leading-none"
      @click="emit('changeDate', 'today')"
    >
      <UiIconReturn class="size-5" />
    </div>

    <div
      :class="[
        getStyles('item', ['link', 'rounded', 'minh2', 'center', 'minw1']),
        { '!hocus:transparent opacity-30': props.isLastPeriod },
      ]"
      class="flex-center bg-item-4"
      @click="emit('changeDate', 'next')"
    >
      <UiIconChevron class="size-8" />
    </div>

    <div
      :class="[
        getStyles('item', ['link', 'rounded', 'minh2', 'center', 'minw1']),
        { '!hocus:transparent opacity-30': props.isToday },
      ]"
      class="flex-center bg-item-4"
      @click="emit('changeDate', 'prev')"
    >
      <UiIconChevron class="size-8 rotate-180" />
    </div>
  </div>
</template>
