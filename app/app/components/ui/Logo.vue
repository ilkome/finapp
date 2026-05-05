<script setup lang="ts">
const { size = 'sm' } = defineProps<{
  size?: 'sm' | 'lg'
}>()

const { t } = useI18n()
</script>

<template>
  <span
    class="font-brand first-letter:text-primary"
    :class="size === 'lg' ? 'text-6xl font-extrabold' : 'text-2xl font-bold'"
  >
    {{ t('appName') }}
  </span>
</template>
