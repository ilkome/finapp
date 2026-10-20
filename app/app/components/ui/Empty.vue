<script setup lang="ts">
const props = defineProps<{
  icon?: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 px-2 py-3 text-sm text-muted">
    <Icon v-if="props.icon" :name="props.icon" size="18" class="shrink-0 text-dimmed" />
    <div class="grow leading-snug">
      <slot />
    </div>
    <slot name="action" />
  </div>
</template>
