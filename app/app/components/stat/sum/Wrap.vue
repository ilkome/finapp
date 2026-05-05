<script setup lang="ts">
import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  averageTotal?: Record<string, number>
  categoryId?: CategoryId
  filteredType: SeriesSlugSelected
  total: TotalReturns
  trnsIds: TrnId[]
  type: SeriesSlugSelected | StatTabSlug
  walletId?: WalletId
}>()

const emit = defineEmits<{
  click: [type: SeriesSlugSelected]
  clickAverage: []
}>()

const statConfig = inject(statConfigKey)!

const isShowAverage = computed(() => statConfig.config.value.statAverage.isShow)

const className = computed(() => cn(
  'min-w-min min-h-[42px] flex items-center',
  {
    interactive: props.type === 'summary',
  },
))

function onClick(type: SeriesSlugSelected) {
  emit('click', type)
}
</script>

<template>
  <div class="overflow-x-auto">
    <div
      v-if="props.type === 'summary'"
      class="flex flex-wrap gap-2 @2xl/stat:justify-start"
    >
      <StatSumItem
        :amount="-total.expense"
        :isActive="filteredType === 'expense'"
        :class="className"
        type="expense"
        @click="onClick('expense')"
      >
        <StatAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          statTabSlug="expense"
        />
      </StatSumItem>

      <StatSumItem
        :amount="total.income"
        :isActive="filteredType === 'income'"
        :class="className"
        type="income"
        @click="onClick('income')"
      >
        <StatAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          statTabSlug="income"
        />
      </StatSumItem>

      <StatSumItem
        :amount="total.sum"
        :class="className"
        type="netIncome"
        @click="onClick('netIncome')"
      >
        <StatAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          statTabSlug="netIncome"
        />
      </StatSumItem>
    </div>

    <div v-else class="flex items-center justify-start">
      <StatSumItem
        :amount="props.type === 'income' ? total.income : -((total as Record<string, number>)[props.type]!)"
        :class="className"
        :type="(props.type as SeriesSlugSelected)"
        :averageTotal="isShowAverage ? props.averageTotal : undefined"
        plain
        @click="emit('clickAverage')"
      >
        <StatAverage
          v-if="isShowAverage"
          :categoryId
          :statTabSlug="(props.type ?? 'netIncome') as SeriesSlugSelected"
          :trnsIds
          :walletId
        />
      </StatSumItem>
    </div>
  </div>
</template>
