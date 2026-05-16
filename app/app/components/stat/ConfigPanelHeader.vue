<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits<{
  back: []
}>()

const { t } = useI18n()
</script>

<template>
  <div
    role="button"
    tabindex="0"
    :aria-label="t('base.previous')"
    class="hover:bg-elevated/50 sticky top-0 z-10 flex w-full items-center gap-2 rounded-sm bg-(--ui-bg) px-2 py-3 text-left"
    @click="emit('back')"
    @keydown.enter.prevent="emit('back')"
    @keydown.space.prevent="emit('back')"
  >
    <Icon name="lucide:chevron-left" class="text-muted" size="20" />
    <span class="text-toned grow text-sm font-medium">{{ title }}</span>
  </div>
</template>
