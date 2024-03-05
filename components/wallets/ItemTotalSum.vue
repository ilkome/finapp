<script setup lang="ts">
import { getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/amount/getTotal'
import type { WalletId } from '~/components/wallets/types'
import type { TrnId } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = withDefaults(defineProps<{
  trnsIds: TrnId[]
  walletId: WalletId
}>(), {
  trnsIds: () => [],
})

const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()

const wallet = computed(() => walletsStore.items[props.walletId])

const total = computed(() => {
  const trnsItems = trnsStore.items
  const walletsItems = walletsStore.items
  const categoriesItems = categoriesStore.items
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
        .pb-2.text-lg.leading-none.font-primary.font-semibold.text-item-base
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
        .pb-2.text-lg.leading-none.font-primary.font-semibold.text-item-base
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
        .pb-2.text-lg.leading-none.font-primary.font-semibold.text-item-base
          | {{ $t('money.sum') }}
        .text-xl
          Amount(
            :amount="total.sumTransactions"
            :currencyCode="wallet.currency"
            :type="3"
          )
</template>
