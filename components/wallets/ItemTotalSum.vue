<script setup lang="ts">
import { getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/amount/getTotal'
import type { WalletId } from '~/components/wallets/types'
import type { TrnId } from '~/components/trns/types'

const props = withDefaults(defineProps<{
  trnsIds: TrnId[]
  walletId: WalletId
}>(), {
  trnsIds: () => [],
})

const { $store } = useNuxtApp()

const wallet = computed(() => $store.state.wallets.items[props.walletId])

const total = computed(() => {
  const trnsItems = $store.state.trns.items
  const walletsItems = $store.state.wallets.items
  const categoriesItems = $store.state.categories.items
  const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)
  return getTotal({
    trnsIds: props.trnsIds,
    trnsItems,
    transferCategoriesIds,
    walletsIds: [props.walletId],
    walletsItems,
  })
})
</script>

<template lang="pug">
.py-3
  .overflow-hidden.overflow-x-auto.scrollbar
    .flex.gap-6
      //- Expense
      div
        .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-item-base
          | {{ $t('money.expense') }}
        .text-xl
          Amount(
            :amount="total.expenseTransactions"
            :currencyCode="wallet.currency"
            :type="0"
            colorize="expense"
          )

      //- Income
      div
        .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-item-base
          | {{ $t('money.income') }}
        .text-xl
          Amount(
            :amount="total.incomeTransactions"
            :currencyCode="wallet.currency"
            :type="1"
            colorize="income"
          )

      //- Sum
      div
        .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-item-base
          | {{ $t('money.sum') }}
        .text-xl
          Amount(
            :amount="total.sumTransactions"
            :currencyCode="wallet.currency"
            :type="3"
          )
</template>
