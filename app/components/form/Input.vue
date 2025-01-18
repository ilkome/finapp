<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  placeholder?: string
  type?: 'text' | 'number' | 'color'
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
    :class="getStyles('item', ['link', 'rounded'])"
    :type="props.type ?? 'text'"
    class="m-0 w-full border border-solid border-item-6 bg-item-3 px-3 py-2 text-base font-normal placeholder:text-2 focus:border-accent-1 focus:bg-item-5 focus:text-1 focus:outline-none"
    @input="(event: HTMLInputEvent) => emit('updateValue', event.target.value)"
  >
</template>
