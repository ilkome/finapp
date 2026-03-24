<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { maxHeight = '60vh' } = defineProps<{
  maxHeight?: string
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()
const walletId = computed(() =>
  trnsFormStore.values.walletId ?? walletsStore.sortedIds[0],
)
</script>

<template>
  <div class="grid gap-3 px-3 pb-6">
    <UiTitleModal @click="trnsFormStore.values.trnId = null">
      {{ trnsFormStore.values.trnId ? t('trnForm.titleEditTrn') : t('trnForm.createTrn') }}
    </UiTitleModal>

    <TrnFormEditedTrn v-if="trnsFormStore.values.trnId" />

    <div class="flex items-center gap-1">
      <TrnFormDate />
      <TrnFormMainDescription />
    </div>

    <TrnFormMainTypes />

    <TrnFormMainInput
      v-if="trnsFormStore.values.trnType !== TrnType.Transfer"
      :amount="trnsFormStore.values.amount[trnsFormStore.activeAmountIdx]"
      :amountRaw="trnsFormStore.values.amountRaw[trnsFormStore.activeAmountIdx]"
      :highlight="trnsFormStore.values.trnType === TrnType.Expense ? 'expense' : 'income'"
      :isShowSum="trnsFormStore.shouldShowSum()"
      @change="trnsFormStore.onChangeAmount"
    />

    <!-- Selected -->
    <div
      v-if="trnsFormStore.values.trnType !== TrnType.Transfer"
      class="grid grid-cols-2 gap-2"
    >
      <TrnFormSelectorWallet
        v-if="walletId"
        :bottomSheetStyle="{ maxHeight }"
        :title="t('trnForm.wallet.select')"
        :walletId="walletId"
        @selected="(id: WalletId) => trnsFormStore.values.walletId = id"
      />

      <TrnFormSelectorCategory
        v-if="trnsFormStore.values.categoryId || categoriesStore.categoriesIdsForTrnValues[0]"
        :bottomSheetStyle="{ maxHeight }"
        :category="categoriesStore.items[(trnsFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0])!]!"
        :categoryId="(trnsFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0])!"
        @selected="(id: CategoryId) => trnsFormStore.values.categoryId = id"
      />
    </div>

    <TrnFormMainAmountTransfer
      v-if="trnsFormStore.values.trnType === TrnType.Transfer"
      :bottomSheetStyle="{ maxHeight }"
    />

    <TrnFormMainCalculator />
  </div>
</template>

<style lang="css">
@reference '../../assets/css/main.css';

.trnForm {
  padding-bottom: calc(env(safe-area-inset-bottom) - 16px);

  .trnForm__pagination {
    @apply absolute left-1/2 z-[2] flex items-center justify-center w-auto p-1.5 rounded-md bg-(--item-1);
    transform: translateX(-50%);
    bottom: 1px;
  }

  .swiper-pagination-bullet {
    @apply block w-1.5 h-1.5 mx-1 rounded-full bg-item-4;
    opacity: 1;
  }

  .swiper-pagination-bullet-active {
    @apply bg-(--ui-primary);
  }
}
</style>
