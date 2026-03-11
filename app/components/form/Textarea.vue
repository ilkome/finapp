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
    class="border-item-6 bg-item-3 placeholder:text-muted m-0 w-full rounded-sm border border-solid px-3 py-2 text-base font-normal outline-none hover:bg-(--item-5) focus:border-(--ui-primary)"
    @input="(event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value)"
  />
</template>
