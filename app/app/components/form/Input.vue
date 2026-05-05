<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  placeholder?: string
  type?: 'text' | 'number' | 'color'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :placeholder="props.placeholder"
    :value="props.modelValue"
    :type="props.type ?? 'text'"
    class="bg-elevated/30 placeholder:text-muted hover:bg-elevated/50 focus:bg-elevated/50 focus:border-primary m-0 min-h-[42px] w-full rounded-md border border-transparent px-4 py-2 text-base font-normal outline-none"
    @input="(event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)"
  >
</template>
