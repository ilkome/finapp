<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import useWallets from '~/components/wallets/useWallets'

const { t } = useI18n()
const { walletsCurrencies } = useWallets()
const currenciesStore = useCurrenciesStore()
</script>

<template>
  <UiTabs3 v-if="walletsCurrencies.length > 1">
    <UiTabsItem2
      v-for="currency in walletsCurrencies"
      :key="currency"
      :isActive="currency === currenciesStore.base"
      @click="currenciesStore.setBase(currency)"
    >
      {{ currency }}
    </UiTabsItem2>

    <UiTabsItem2 @click="currenciesStore.showBaseCurrenciesModal()">
      <div class="flex-center">
        <span>{{ t("more") }}</span>
        <span class="mdi mdi-dots-vertical ml-1" />
      </div>
    </UiTabsItem2>
  </UiTabs3>
</template>

<i18n lang="yaml">
en:
  more: More

ru:
  more: Еще
</i18n>
