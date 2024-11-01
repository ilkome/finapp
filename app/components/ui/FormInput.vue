<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  placeholder: string
  value: string | number
}>()

const emit = defineEmits<{
  updateValue: [value: string]
}>()
</script>

<template>
  <input
    :placeholder="props.placeholder"
    :value="props.value"
    :class="getStyles('item', ['link'])"
    class="text-item-base bg-item-4 border-item-5 placeholder:text-item-2 focus:text-item-1 focus:bg-item-5 focus:border-accent-4 m-0 w-full rounded-lg border border-solid px-4 py-2.5 text-base font-normal transition ease-in-out focus:outline-none"
    type="text"
    @input="(event: HTMLInputEvent) => emit('updateValue', event.target.value)"
  >
</template>
