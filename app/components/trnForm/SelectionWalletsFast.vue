<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const { t } = useI18n()
const trnFormStore = useTrnFormStore()
</script>

<template>
  <div>
    <UiTitle3
      class="bg-foreground-1 sticky top-0 z-10 px-3 pb-3 pt-4"
      @click="trnFormStore.openTrnFormModal('wallets')"
    >
      {{ t("wallets.title") }}
    </UiTitle3>

    <WalletsList
      v-slot="{ walletsItemsLimited }"
      :limit="5"
      class="px-3 pt-1"
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
