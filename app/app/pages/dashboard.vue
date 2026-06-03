<script setup lang="ts">
import { useInitApp } from '~/components/app/useInitApp'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

defineOptions({ name: 'Dashboard' })

const { t } = useI18n()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const { isDbLoading, isHydrated } = useInitApp()

const isOnboardedHint = useCookie('finapp.isOnboarded', { default: () => false })
const isOnboarded = computed(() => walletsStore.hasItems && categoriesStore.hasItems && trnsStore.hasItems)

// Show the dashboard for a returning onboarded user on the first frame (hint), before local
// SQLite has hydrated - so they never see the onboarding flash.
const showStat = computed(() => isOnboarded.value || (!isHydrated.value && isOnboardedHint.value))
// Only conclude "not onboarded" once hydrated AND the first sync settled: an empty DB mid-sync
// is "unknown", not "new", so showing onboarding there would flash it before data arrives.
const showOnboarding = computed(() => isHydrated.value && !isOnboarded.value && !isDbLoading.value)

useSeoMeta({
  ogTitle: t('stat.title'),
  titleTemplate: t('stat.title'),
})
</script>

<template>
  <StatPage v-if="showStat" />
  <LazyAppOnboarding v-else-if="showOnboarding" />
</template>
