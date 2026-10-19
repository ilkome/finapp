<script setup lang="ts">
import { useFeatures } from '~/composables/useFeatures'

defineOptions({ name: 'WalletsAnalytics' })

definePageMeta({
  middleware: () => {
    if (!useFeatures().value.walletsAnalytics)
      return navigateTo('/wallets', { replace: true })
  },
})
</script>

<template>
  <WalletsAnalyticsPage />
</template>
