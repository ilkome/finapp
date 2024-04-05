<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const trnsStore = useTrnsStore()

useHead({
  title: t('stat.title'),
})

definePageMeta({
  keepalive: true,
})
</script>

<template>
  <LazyStat v-if="trnsStore.hasTrns" />
  <LazyWelcomeActions v-else />
</template>
