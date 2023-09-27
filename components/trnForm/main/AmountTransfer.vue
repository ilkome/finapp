<script setup lang="ts">
import { type TransferType, TrnType } from '~/components/trns/types'
import type { WalletId } from '~~/components/wallets/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const $trnForm = useTrnFormStore()
const { $store } = useNuxtApp()

const items = ref<Record<'expense' | 'income', {
  transferType: TransferType
  amountsIdx: 1 | 2
}>>({
  expense: {
    transferType: 0,
    amountsIdx: 1,
  },
  income: {
    transferType: 1,
    amountsIdx: 2,
  },
})

const incomeWalletId = computed<WalletId | null>(() =>
  $trnForm.values.incomeWalletId ?? $store.getters['wallets/walletsSortedIds'][0],
)

const expenseWalletId = computed<WalletId | null>(() =>
  $trnForm.values.expenseWalletId ?? $store.getters['wallets/walletsSortedIds'][1],
)

watch(() => $trnForm.values.trnType, (trnType) => {
  if (trnType === TrnType.Transfer) {
    $trnForm.values.incomeWalletId = incomeWalletId.value
    $trnForm.values.expenseWalletId = expenseWalletId.value
  }
}, { immediate: true })
</script>

<template lang="pug">
.pb-2
  .flex.flex-col
    .cursor-pointer.overflow-hidden.rounded-md(
      v-for="(item, slug) in items"
      :key="slug"
      :class="[{ '!bg-skin-item-main-active': $trnForm.values.transferType === item.transferType }]"
      @click="$trnForm.onChangeTransferType(item.transferType)"
    )
      //- Wallet name
      .px-3.pt-2.grid.items-center.whitespace-nowrap(
        class="grid-cols-[.4fr,1fr]"
      )
        .grow.text-sm(class="w-1/2 text-primary/70") {{ $t(slug) }}
        template(v-if="slug === 'income'")
          TrnFormMainSelectedWallet(
            :key="incomeWalletId"
            :id="incomeWalletId"
            @click="$store.commit('trnForm/showTrnFormModal', 'transferTo')"
          )
        template(v-if="slug === 'expense'")
          TrnFormMainSelectedWallet(
            :key="expenseWalletId"
            :id="expenseWalletId"
            @click="$store.commit('trnForm/showTrnFormModal', 'transferFrom')"
          )

      //- Input
      TrnFormMainInput(
        :key="item.amountsIdx"
        :amount="$trnForm.values.amount[item.amountsIdx]"
        :amountRaw="$trnForm.values.amountRaw[item.amountsIdx]"
        :highlight="item.transferType === 1 ? 'expense' : 'income'"
        :isShowSum="$trnForm.getIsShowSum(item.amountsIdx)"
        isTransfer
        @onChange="$trnForm.onChangeAmount"
      )
</template>

<i18n lang="yaml">
en:
  expense: Transfer from
  income: Transfer to
ru:
  expense: Перевод из
  income: Перевод в
</i18n>
