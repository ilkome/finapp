<script setup lang="ts">
const { $store, nuxt2Context: { i18n } } = useNuxtApp()
const router = useRouter()

useHead({
  title: i18n.t('stat.title'),
})

if (!$store.getters['wallets/hasWallets'] || !$store.getters['categories/hasCategories'])
  router.replace('/welcome')
</script>

<template lang="pug">
UiPage
  LazyStatView(v-if="$store.getters['trns/hasTrns']")
  LazyStatWelcomeActions(v-else)
</template>
