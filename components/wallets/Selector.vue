<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'
import useWallets from '~/components/wallets/useWallets'

defineProps<{
  // isShow: boolean
  title: string
}>()

const emit = defineEmits<{
  onSelected: [id: WalletId]
  onClose: []
}>()

const { walletsItemsSorted } = useWallets()

function onClickWallet(walletId: WalletId, close: () => void) {
  emit('onSelected', walletId)
  close()
}
</script>

<template>
  <TrnFormModal
    @closed="emit('onClose')"
  >
    <template #header>
      <div> {{ title }}</div>
    </template>

    <template #default="{ close }">
      <div class="grid gap-1 py-2 px-2">
        <WalletsItem3
          v-for="(wallet, walletId) in walletsItemsSorted"
          :key="walletId"
          :walletId
          :wallet
          isHideDots
          @click="onClickWallet(walletId, close)"
        />
      </div>
    </template>
  </TrnFormModal>
</template>
