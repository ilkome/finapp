<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const trnFormStore = useTrnFormStore()
</script>

<template>
  <div>
    <UiTitle3
      class="z-10 sticky pb-3 top-0 px-3 bg-foreground-1"
      @click="trnFormStore.openTrnFormModal('wallets')"
    >
      {{ $t("wallets.title") }}
    </UiTitle3>

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
        isShowIcons
        @click="trnFormStore.values.walletId = walletId"
      />
    </WalletsList>
  </div>
</template>
