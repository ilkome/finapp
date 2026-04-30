<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number
  placeholder: string
  type?: 'text' | 'number'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea
    :placeholder="props.placeholder"
    :value="props.modelValue"
    class="bg-elevated/30 placeholder:text-muted hover:bg-elevated/50 focus:border-primary m-0 w-full rounded-md border border-transparent px-4 py-2 text-base font-normal outline-none"
    @input="(event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value)"
  />
</template>
