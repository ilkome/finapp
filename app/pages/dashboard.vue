<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const trnsStore = useTrnsStore()

useSeoMeta({
  description: t('app.desc'),
  ogDescription: t('app.desc'),
  ogTitle: t('stat.title'),
  titleTemplate: t('stat.title'),
})

usePageScroll()
</script>

<template>
  <StatDashboard v-if="trnsStore.hasItems" />
  <LazyAppWelcome v-else />
</template>
