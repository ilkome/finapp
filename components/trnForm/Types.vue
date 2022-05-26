<script setup lang="ts">
const { $store } = useNuxtApp()
const amountType = computed(() => $store.state.trnForm.values.amountType)

function setAmountType(amountType) {
  $store.commit('trnForm/setTrnFormValues', { amountType })
}
</script>

<template lang="pug">
.px-4.pb-4
  UiTabs
    UiTabsItem(
      :isActive="amountType === 0"
      @click="setAmountType(0)"
    ) {{ $t('money.expense') }}

    UiTabsItem(
      :isActive="amountType === 1"
      @click="setAmountType(1)"
    ) {{ $t('money.income') }}

    UiTabsItem(
      v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
      :isActive="amountType === 2"
      @click="setAmountType(2)"
    ) {{ $t('trnForm.transferTitle') }}
</template>
