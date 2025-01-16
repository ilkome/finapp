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
  <textarea
    :placeholder="props.placeholder"
    :value="props.value"
    :class="getStyles('item', ['link', 'rounded'])"
    class="m-0 w-full border border-solid border-item-6 bg-item-4 px-3 py-2 text-base font-normal placeholder:text-2 focus:border-accent-1 focus:bg-item-hover focus:text-1 focus:outline-none"
    @input="(event: HTMLInputEvent) => emit('updateValue', event.target.value)"
  />
</template>
