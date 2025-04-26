<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <div>
    <UiTitleModal>
      {{ t('wallets.title') }}
    </UiTitleModal>

    <WalletsList
      v-slot="{ walletsItemsLimited }"
      :limit="5"
      class="grid grid-cols-2 gap-1 px-3 pt-1"
    >
      <WalletsItem
        v-for="(wallet, walletId) in walletsItemsLimited"
        :key="walletId"
        :activeItemId="trnsFormStore.values.walletId"
        :walletId
        :wallet
        isShowIcon
        isShowCreditLimit
        alt
        @click="trnsFormStore.values.walletId = walletId"
      />
    </WalletsList>
  </div>
</template>
