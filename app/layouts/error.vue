<script setup lang="ts">
// TODO: Add locale
defineProps<{
  error: unknown
}>()

const route = useRoute()
const router = useRouter()

if (Object.keys(route.query).length > 0)
  router.replace({ query: undefined })
</script>

<template>
  <div class="p-4">
    <h1>Error</h1>
    <pre>{{ error }}</pre>
    <h1 @click="router.push('/')">
      Go to home
    </h1>
    <slot />
  </div>
</template>
