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
    <h1 @click="router.push('/')">
      {{ t('actionError.goHome') }}
    </h1>
    <slot />
  </div>
</template>
