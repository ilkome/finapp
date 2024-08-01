<script setup lang="ts">
// TODO: Add locale
defineProps<{
  error: unknown
}>()

if (Object.keys(useRoute().query).length > 0)
  useRouter().replace({ query: undefined })

useHead({
  bodyAttrs: {
    class: '',
  },
  htmlAttrs: {
    lang: useI18n().locale.value,
  },
})
</script>

<template>
  <div class="p-4">
    <h1>Error</h1>
    <pre>{{ error }}</pre>
    <h1 @click="$router.push('/')">
      Go to home
    </h1>
    <NuxtPage />
  </div>
</template>
