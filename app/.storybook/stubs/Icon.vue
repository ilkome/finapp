<script setup lang="ts">
// Nuxt's `<Icon>` lives in @nuxt/icon and needs the Nuxt build; in Vue mode UIcon does the job.
const { name } = defineProps<{ name: string }>()
</script>

<template>
  <UIcon :name="name" />
</template>
