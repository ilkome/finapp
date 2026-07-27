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
    class="m-0 min-h-10.5 w-full rounded-md border border-transparent bg-elevated/30 px-4 py-2 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary focus:bg-elevated/50"
    @input="(event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)"
  >
</template>
