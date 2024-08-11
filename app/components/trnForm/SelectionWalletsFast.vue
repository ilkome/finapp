<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const trnFormStore = useTrnFormStore()
</script>

<template>
  <div>
    <UiTitle
      class="px-3 pb-2 pt-1.5"
      @click="trnFormStore.openTrnFormModal('wallets')"
    >
      {{ $t("wallets.title") }}
    </UiTitle>

    <WalletsList
      v-slot="{ walletsItemsLimited }"
      :limit="5"
      class="px-3"
    >
      <WalletsItem
        v-for="(wallet, walletId) in walletsItemsLimited"
        :key="walletId"
        :activeItemId="trnFormStore.values.walletId"
        :walletId
        :wallet
        :lineWidth="1"
        @click="trnFormStore.values.walletId = walletId"
      />
    </WalletsList>
  </div>
</template>
