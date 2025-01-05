<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <div>
    <UiTitleModal @click="trnsFormStore.openTrnFormModal('wallets')">
      {{ t("wallets.title") }}
    </UiTitleModal>

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
