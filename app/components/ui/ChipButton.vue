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
    class="interactive bg-elevated flex min-h-[38px] min-w-[42px] grow cursor-default items-center justify-center rounded-sm px-2 py-1.5 text-sm"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </button>
</template>
