<script setup lang="ts">
const props = defineProps<{
  isShown?: boolean
}>()
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="flex min-h-9.5 min-w-10.5 grow items-center gap-1 rounded-sm interactive px-3 pb-0"
    @click="emit('click')"
  >
    <slot />

    <Icon
      :name="props.isShown ? 'lucide:chevron-down' : 'lucide:chevron-right'"
      size="18"
      class="shrink-0 text-muted"
    />

    <slot name="after" />
  </div>
</template>
