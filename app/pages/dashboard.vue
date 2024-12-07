<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const trnsStore = useTrnsStore()

useHead({ title: t('stat.title') })

usePageScroll()
</script>

<template>
  <StatDashboard v-if="trnsStore.hasItems" />
  <LazyAppWelcome v-else />
</template>
