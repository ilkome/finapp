<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
const { $store } = useNuxtApp()

const walletId = computed(() => {
  const walletsIds = Object.keys($store.state.wallets.items)
  const walletId = walletsIds[0]
  return $trnForm.values.walletId ?? walletId
})
</script>

<template lang="pug">
.px-2.pb-2.grid.grid-cols-2.gap-3
  TrnFormMainSelectedWallet(
    :id="walletId"
    @click="$store.commit('trnForm/showTrnFormModal', 'wallets')"
  )
  TrnFormMainSelectedCategory
</template>
