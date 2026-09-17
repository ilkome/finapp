<script setup lang="ts">
const props = defineProps<{
  placeholder?: string
  size?: 'md' | 'xl'
}>()

const emit = defineEmits<{
  enter: []
  escape: []
}>()

const value = defineModel<string>({ default: '' })
const { t } = useI18n()
const input = useTemplateRef<{ inputRef?: HTMLInputElement }>('input')

defineExpose({
  blur: () => input.value?.inputRef?.blur(),
  focus: () => input.value?.inputRef?.focus(),
})
</script>

<template>
  <UInput
    ref="input"
    v-model="value"
    class="w-full"
    icon="i-lucide-search"
    :placeholder="props.placeholder ?? t('base.search')"
    :size="props.size ?? 'xl'"
    @keydown.enter.prevent="emit('enter')"
    @keydown.escape.stop="emit('escape')"
  >
    <template v-if="value" #trailing>
      <UButton
        :aria-label="t('base.clear')"
        color="neutral"
        icon="i-lucide-x"
        size="sm"
        variant="link"
        @click="value = ''"
      />
    </template>
  </UInput>
</template>
