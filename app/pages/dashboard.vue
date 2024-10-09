<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const trnsStore = useTrnsStore()

useHead({
  title: t('stat.title'),
})
</script>

<template>
  <LazyStat v-if="trnsStore.hasTrns" />
  <LazyWelcomeActions v-else />
</template>
