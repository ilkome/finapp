<script setup lang="ts">
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const trnsStore = useTrnsStore()

useHead({ title: t('stat.title') })
</script>

<template>
  <div
    v-if="trnsStore.hasItems"
    class="h-full overflow-hidden overflow-y-auto"
  >
    <StatDashboard />
  </div>

  <LazyAppWelcome v-else />
</template>
