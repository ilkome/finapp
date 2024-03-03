<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const $trnForm = useTrnFormStore()
const walletsStore = useWalletsStore()

const walletId = computed(() => {
  const walletsIds = Object.keys(walletsStore.items ?? {})
  const walletId = walletsIds[0]
  return $trnForm.values.walletId ?? walletId
})
</script>

<template lang="pug">
.px-2.pb-2.grid.grid-cols-2.gap-3
  TrnFormMainSelectedWallet(
    v-if="walletId"
    :id="walletId"
    @click="$trnForm.openTrnFormModal('wallets')"
  )
  TrnFormMainSelectedCategory
</template>
