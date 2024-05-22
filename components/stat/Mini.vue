<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { AppNav } from '~/components/app/types'

const props = defineProps<{
  categoryId?: CategoryId
  walletId?: WalletId
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const currenciesStore = useCurrenciesStore()

const activeTab = useStorage<AppNav>('activeTabStatIn', 'sum')

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.categoryId ? [props.categoryId] : [],
  walletsIds: props.walletId ? [props.walletId] : [],
}, {
  includesChildCategories: true,
}))

const expenseTrnsIds = computed(() =>
  trnsIds.value.filter(
    trnId => trnsStore.items[trnId].type === 0 || trnsStore.items[trnId].type === 2,
  ),
)

const incomeTrnsIds = computed(() =>
  trnsIds.value.filter(
    trnId => trnsStore.items[trnId].type === 1 || trnsStore.items[trnId].type === 2,
  ),
)

const totals = computed(() => getTotalOfTrnsIds(trnsIds.value))
</script>

<template>
  <div class="grid gap-4">
    <template
      v-if="totals.income && totals.expense"
    >
      <div class="flex flex-wrap gap-6">
        <div v-if="totals.expense">
          <UiTitle5>{{ $t('money.expense') }}</UiTitle5>

          <Amount
            :amount="totals.expense"
            :currencyCode="currenciesStore.base"
            align="left"
            variant="3xl"
          />
        </div>

        <div v-if="totals.income">
          <UiTitle5>{{ $t('money.income') }}</UiTitle5>

          <Amount
            :amount="totals.income"
            :currencyCode="currenciesStore.base"
            align="left"
            variant="3xl"
          />
        </div>

        <div v-if="totals.income && totals.expense">
          <UiTitle5>{{ $t('money.sum') }}</UiTitle5>

          <Amount
            :amount="totals.sum"
            :currencyCode="currenciesStore.base"
            align="left"
            variant="3xl"
          />
        </div>
      </div>
    </template>

    <StatMenu2
      :active="activeTab"
      :isShowIncome="totals.income !== 0"
      :isShowExpense="totals.expense !== 0"
      class="flex grow items-center sm_gap-2"
      @click="id => activeTab = id"
    />

    <!-- Sum -->
    <div
      v-if="activeTab === 'sum' && totals.sum && (totals.expense !== 0 && totals.income !== 0)"
      class="grid md_grid-cols-2 gap-24"
    >
      <StatMiniItem
        :trnsIds="trnsIds"
        type="sum"
      />
    </div>

    <div class="grid md_grid-cols-2 gap-24">
      <!-- Expense -->
      <StatMiniItem
        v-if="(activeTab === 'sum' || activeTab === 'expense') && totals.expense"
        :trnsIds="expenseTrnsIds"
        type="expense"
      />

      <!-- Income -->
      <StatMiniItem
        v-if="(activeTab === 'sum' || activeTab === 'income') && totals.income"
        :trnsIds="incomeTrnsIds"
        type="income"
      />

      <TrnsList
        v-if="activeTab === 'trns' || (!totals.income && !totals.expense)"
        isShowHeader
        :trnsIds
      />
    </div>
  </div>
</template>
