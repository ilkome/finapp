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
    class="m-0 w-full rounded-md border border-transparent bg-elevated/30 px-4 py-2 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary"
    @input="(event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value)"
  />
</template>
