<script setup lang="ts">
defineProps<{
  error: unknown
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

if (Object.keys(route.query).length > 0)
  router.replace({ query: undefined })
</script>

<template>
  <div class="p-4">
    <h1>{{ t('actionError.title') }}</h1>
    <pre>{{ error }}</pre>
    <NuxtLink to="/" class="text-inherit">
      <h1>{{ t('actionError.goHome') }}</h1>
    </NuxtLink>
    <slot />
  </div>
</template>
