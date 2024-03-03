<script setup lang="ts">
import 'v-calendar/style.css';
import { useCategoriesStore } from '~/components/categories/useCategories';
import { useTrnsStore } from '~/components/trns/useTrnsStore';
import { useWalletsStore } from '~/components/wallets/useWalletsStore';

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

useHead({
  title: t('stat.title'),
})

// if (!walletsStore.hasWallets || !categoriesStore.hasCategories)
//   router.replace('/welcome')
</script>

<template>
  <UiPage>
    <LazyStatView v-if="trnsStore.hasTrns" />
    <LazyStatWelcomeActions v-else />
  </UiPage>
</template>
