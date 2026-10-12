<script setup lang="ts">
import { useFeatures } from '~/composables/useFeatures'

defineOptions({ name: 'Loans' })

definePageMeta({
  middleware: () => {
    if (!useFeatures().value.loans)
      return navigateTo('/dashboard', { replace: true })
  },
})
</script>

<template>
  <LoansPage />
</template>
