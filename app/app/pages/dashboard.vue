<script setup lang="ts">
import { useInitApp } from '~/components/app/useInitApp'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const { bootState } = useInitApp()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()

// Data may still be hydrating (cache prime / first watch emission) after the shell paints;
// a skeleton holds the page shape until then so arriving rows don't shift the layout.
const hasAnyData = computed(() => trnsStore.hasItems || walletsStore.hasItems)

useSeoMeta({
  ogTitle: t('stat.title'),
  titleTemplate: t('stat.title'),
})
</script>

<template>
  <StatPage v-if="bootState === 'ready' && hasAnyData" />
  <StatPageSkeleton v-else-if="bootState === 'ready'" />
  <LazyAppOnboarding v-else-if="bootState === 'onboarding'" />
</template>
