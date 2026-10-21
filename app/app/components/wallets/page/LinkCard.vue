<script setup lang="ts">
defineProps<{
  title: string
  /** Navigates instead of emitting `click`. */
  to?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <UiCard
    as="button"
    chevron="right"
    class="gap-2"
    :title
    :to
    @click="$emit('click')"
  >
    <slot />
  </UiCard>
</template>
