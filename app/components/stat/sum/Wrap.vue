<script setup lang="ts">
import { cn } from '~~/lib/cn'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/filter/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { classes } from '~/components/ui/getStyles'

const props = defineProps<{
  averageTotal?: Record<string, number>
  categoryId?: CategoryId
  filteredType: StatTabSlug
  isShowAverage: boolean
  isShowExpense: boolean
  isShowIncome: boolean
  statTabSlug?: StatTabSlug
  total: TotalReturns
  trnsIds: TrnId[]
  type: StatTabSlug
  walletId?: WalletId
}>()

const emit = defineEmits<{
  click: [type: SeriesSlugSelected]
  clickAverage: []
}>()

const statConfig = inject('statConfig') as StatConfigProvider
const filter = inject('filter') as FilterProvider
const statDate = inject('statDate') as StatDateProvider

const className = computed(() => cn([
  'min-w-min',
  [classes.item.rounded, classes.item.minh1, classes.item.center, classes.item.padding3],
  {
    [classes.item.link]: props.isShowIncome && props.isShowExpense && props.type === 'summary',
  },
]))

function onClick(type: SeriesSlugSelected) {
  if (props.isShowIncome && props.isShowExpense) {
    emit('click', type)
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <div
      v-if="props.type === 'summary'"
      class="flex flex-wrap gap-2 @2xl/page:justify-start"
    >
      <StatSumItem
        v-if="props.isShowExpense"
        :amount="-total.expense"
        :isActive="filteredType === 'expense'"
        :class="className"
        type="expense"
        @click="onClick('expense')"
      >
        <StatAverage
          v-if="props.isShowAverage"
          :averageConfig="statConfig.config.value.statAverage.count"
          :categoryId
          :filter
          :statDate
          :trnsIds
          :walletId
          statTabSlug="expense"
        />
      </StatSumItem>

      <StatSumItem
        v-if="props.isShowIncome"
        :amount="total.income"
        :isActive="filteredType === 'income'"
        :class="className"
        type="income"
        @click="onClick('income')"
      >
        <StatAverage
          v-if="props.isShowAverage"
          :averageConfig="statConfig.config.value.statAverage.count"
          :categoryId
          :filter
          :statDate
          :trnsIds
          :walletId
          statTabSlug="income"
        />
      </StatSumItem>

      <StatSumItem
        v-if="props.isShowIncome && props.isShowExpense"
        :amount="total.sum"
        :class="className"
        type="netIncome"
        @click="onClick('netIncome')"
      >
        <StatAverage
          v-if="props.isShowAverage"
          :averageConfig="statConfig.config.value.statAverage.count"
          :categoryId
          :filter
          :statDate
          :trnsIds
          :walletId
          statTabSlug="netIncome"
        />
      </StatSumItem>
    </div>

    <div v-else class="flex items-center">
      <StatSumItem
        :amount="props.type === 'income' ? total[props.type] : -total[props.type]"
        :class="className"
        :type="props.type"
        :averageTotal="props.isShowAverage ? props.averageTotal : undefined"
        @click="emit('clickAverage')"
      >
        <StatAverage
          v-if="props.isShowAverage"
          :averageConfig="statConfig.config.value.statAverage.count"
          :categoryId
          :filter
          :statDate
          :statTabSlug="props.type ?? 'netIncome'"
          :trnsIds
          :walletId
        />
      </StatSumItem>
    </div>
  </div>
</template>
