<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const trnsStore = useTrnsStore()

useSeoMeta({
  ogTitle: t('stat.title'),
  titleTemplate: t('stat.title'),
})
</script>

<template>
  <StatDashboard v-if="trnsStore.hasItems" />
  <LazyAppWelcome v-else />
</template>
