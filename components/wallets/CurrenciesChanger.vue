<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import useWallets from '~/components/wallets/useWallets'

const { t } = useI18n()
const { walletsCurrencies } = useWallets()
const currenciesStore = useCurrenciesStore()
</script>

<template lang="pug">
UiTabs(v-if="walletsCurrencies.length > 1")
  UiTabsItem(
    v-for="currency in walletsCurrencies"
    :key="currency"
    :isActive="currency === currenciesStore.base"
    @click="currenciesStore.setBaseRate(currency)"
  ) {{ currency }}

  UiTabsItem(@click="currenciesStore.showBaseCurrenciesModal()")
    .flex-center
      span {{ t('more') }}
      span.mdi.mdi-dots-vertical.ml-1
</template>

<i18n lang="yaml">
en:
  more: More

ru:
  more: Еще
</i18n>
