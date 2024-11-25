<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <div>
    <UiTitle3
      class="bg-foreground-1 sticky top-0 z-20 px-3 pb-3 pt-4"
      @click="trnsFormStore.openTrnFormModal('wallets')"
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
        :activeItemId="trnsFormStore.values.walletId"
        :walletId
        :wallet
        :lineWidth="1"
        isShowIcon
        @click="trnsFormStore.values.walletId = walletId"
      />
    </WalletsList>
  </div>
</template>
