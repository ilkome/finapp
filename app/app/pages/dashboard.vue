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
const { isDbLoading } = useInitApp()

const isOnboarded = computed(() => walletsStore.hasItems && categoriesStore.hasItems && trnsStore.hasItems)

useSeoMeta({
  ogTitle: t('stat.title'),
  titleTemplate: t('stat.title'),
})
</script>

<template>
  <StatPage v-if="isOnboarded" />
  <LazyAppOnboarding v-else-if="!isDbLoading" />
</template>
