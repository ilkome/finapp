<script setup lang="ts">
import '~/assets/css/tailwind.css'
import '~/assets/css/theme.css'

// TODO: Add locale
defineProps<{
  error: unknown
}>()

const route = useRoute()
const router = useRouter()

if (Object.keys(route.query).length > 0)
  router.replace({ query: undefined })

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
    <h1 @click="router.push('/')">
      Go to home
    </h1>
    <NuxtPage />
  </div>
</template>
