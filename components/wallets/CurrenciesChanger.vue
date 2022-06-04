<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'
const { walletsCurrencies } = useWallets()
const { $store } = useNuxtApp()

const onSelect = value => $store.dispatch('currencies/changeBaseCurrency', value)
</script>

<template lang="pug">
UiTabs(v-if="walletsCurrencies.length > 1")
  UiTabsItem(
    v-for="currency in walletsCurrencies"
    :key="currency"
    :isActive="currency === $store.state.currencies.base"
    @click="onSelect(currency)"
  ) {{ currency }}

  UiTabsItem(
    @click="$store.commit('currencies/showBaseCurrenciesModal')"
  )
    .flex-center
      span {{ $t('more') }}
      span.mdi.mdi-dots-vertical.ml-1
</template>

<i18n lang="json5">
{
  "en": {
    "more": "More"
  },

  "ru": {
    "more": "Еще"
  },
}
</i18n>
