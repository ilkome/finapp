<script setup lang="ts">
import { useInitApp } from '~/components/app/useInitApp'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const { bootState } = useInitApp()

useSeoMeta({
  ogTitle: t('stat.title'),
  titleTemplate: t('stat.title'),
})
</script>

<template>
  <StatPage v-if="bootState === 'ready'" />
  <LazyAppOnboarding v-else-if="bootState === 'onboarding'" />
</template>
