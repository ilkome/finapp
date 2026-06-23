<script setup lang="ts">
// Renders every extension registered for `name` (see useExtensions). Each is
// wrapped in an error boundary so a broken extension from a layer can never
// take down the host page.
const { name } = defineProps<{ name: string }>()

const extensions = useExtensions(name)
</script>

<template>
  <NuxtErrorBoundary
    v-for="ext in extensions"
    :key="ext.id"
  >
    <component :is="ext.component" />
    <template #error />
  </NuxtErrorBoundary>
</template>
