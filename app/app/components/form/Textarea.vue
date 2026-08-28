<script setup lang="ts">
const props = defineProps<{
  autoResize?: boolean
  modelValue: string | number
  placeholder: string
  type?: 'text' | 'number'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')

function resize() {
  if (!props.autoResize || !textarea.value)
    return
  textarea.value.style.height = 'auto'
  textarea.value.style.height = `${textarea.value.scrollHeight}px`
}

watch(() => props.modelValue, () => nextTick(resize), { immediate: true })

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  resize()
}
</script>

<template>
  <textarea
    ref="textarea"
    :placeholder="props.placeholder"
    :value="props.modelValue"
    class="m-0 w-full rounded-md border border-transparent bg-elevated/30 px-4 py-2 text-base font-normal outline-none placeholder:text-muted hover:bg-elevated/50 focus:border-primary"
    :class="props.autoResize && 'overflow-y-hidden'"
    @input="onInput"
  />
</template>
