<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { t } = useI18n()
const trnsStore = useTrnsStore()

useHead({
  title: t('stat.title'),
})
</script>

<template>
  <UiPage>
    <LazyDashboardPage v-if="trnsStore.hasTrns" />
    <LazyWelcomeActions v-else />
  </UiPage>
</template>
