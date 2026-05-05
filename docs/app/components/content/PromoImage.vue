<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const { locale } = useDocusI18n()

const src = computed(() => {
  const lang = locale.value === 'ru' ? 'ru' : 'en'
  return `/images/screenshots/${props.name}-${lang}-desktop.webp`
})
</script>

<template>
  <div class="mx-auto my-6 max-w-[var(--ui-container)] px-4 sm:px-6 lg:px-8">
    <ProseImg
      :key="src"
      :src="src"
      :alt="name"
      width="2880"
      height="1864"
      loading="lazy"
      class="w-full rounded-lg border border-[var(--ui-border)]"
    />
  </div>
</template>
