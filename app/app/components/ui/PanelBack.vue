<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <div
    :aria-label="$t('base.previous')"
    role="button"
    tabindex="0"
    class="mb-1 flex items-center gap-2 rounded-sm interactive p-2"
    @click="emit('back')"
    @keydown.enter.prevent="emit('back')"
    @keydown.space.prevent="emit('back')"
  >
    <UIcon name="lucide:chevron-left" class="size-5 text-muted" />
    <span class="grow text-sm font-medium text-toned">{{ title }}</span>
    <slot />
  </div>
</template>
