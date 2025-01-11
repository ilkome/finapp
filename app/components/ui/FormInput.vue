<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  placeholder: string
  type?: 'text' | 'number'
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
    :type="props.type ?? 'text'"
    class="border-item-3 bg-item-4 placeholder:text-item-2 focus:border-accent-2 focus:bg-item-hover focus:text-item-1 m-0 w-full rounded-lg border border-solid px-4 py-2.5 text-base font-normal focus:outline-none"
    @input="(event: HTMLInputEvent) => emit('updateValue', event.target.value)"
  >
</template>
