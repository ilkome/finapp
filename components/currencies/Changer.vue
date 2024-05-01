<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const walletsStore = useWalletsStore()
</script>

<template>
  <UiTabs2 v-if="walletsStore.currenciesUsed.length > 1">
    <UiTabsItem2
      v-for="currency in walletsStore.currenciesUsed"
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
  </UiTabs2>
</template>

<i18n lang="yaml">
en:
  more: More

ru:
  more: Еще
</i18n>
