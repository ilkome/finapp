<script setup lang="ts">
import { getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/amount/getTotal'
import type { WalletId } from '~/components/wallets/types'
import type { TrnId } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  trnsIds: TrnId[]
  walletId: WalletId
}>()

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

<template>
  <div class="py-3">
    <div class="scrollbar overflow-hidden overflow-x-auto">
      <div class="flex gap-6">
        <!-- Expense -->
        <div>
          <div
            class="text-item-base pb-2 font-primary text-lg font-semibold leading-none"
          >
            {{ $t("money.expense") }}
          </div>
          <div class="text-xl">
            <Amount
              :amount="total.expenseTransactions"
              :currencyCode="wallet.currency"
              :type="0"
              colorize="expense"
            />
          </div>
        </div>

        <!-- Income -->
        <div>
          <div
            class="text-item-base pb-2 font-primary text-lg font-semibold leading-none"
          >
            {{ $t("money.income") }}
          </div>
          <div class="text-xl">
            <Amount
              :amount="total.incomeTransactions"
              :currencyCode="wallet.currency"
              :type="1"
              colorize="income"
            />
          </div>
        </div>

        <!-- Sum -->
        <div>
          <div
            class="text-item-base pb-2 font-primary text-lg font-semibold leading-none"
          >
            {{ $t("money.sum") }}
          </div>
          <div class="text-xl">
            <Amount
              :amount="total.sumTransactions"
              :currencyCode="wallet.currency"
              :type="3"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
