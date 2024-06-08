<script setup lang="ts">
// TODO: Add locale
defineProps<{
  error: unknown
}>()

if (Object.keys(useRoute().query).length > 0)
  useRouter().replace({ query: null })
</script>

<template lang="pug">
.p-4
  h1 Error
  pre {{ error }}
  h1(@click="$router.push('/')") Go to home
  NuxtPage
</template>
