<script setup lang="ts">
const { ariaLabel } = defineProps<{
  ariaLabel?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <button
    type="button"
    :aria-label="ariaLabel"
    class="flex min-h-9.5 min-w-10.5 grow cursor-default items-center justify-center rounded-sm interactive bg-elevated px-2 py-1.5 text-sm"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </button>
</template>
