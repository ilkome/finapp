<script setup lang="ts">
import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { statConfigKey } from '~/components/stat/injectionKeys'
import { buildStatSummaryItems } from '~/components/stat/sum/summaryItems'

const props = defineProps<{
  averageTotal?: Record<string, number>
  categoryId?: CategoryId
  filteredType: SeriesSlugSelected
  focusedType?: SeriesSlugSelected
  total: TotalReturns
  trnsIds: TrnId[]
  type: SeriesSlugSelected | 'summary'
  walletId?: WalletId
}>()

const emit = defineEmits<{
  click: [type: SeriesSlugSelected]
  clickAverage: []
}>()

const statConfig = inject(statConfigKey)!

const isShowAverage = computed(() => statConfig.config.value.average.isShow)

const className = computed(() => cn(
  'flex min-h-10.5 min-w-min items-center',
  props.type === 'summary' && 'flex-1 @2xl/stat:max-w-max',
  {
    interactive: props.type === 'summary',
  },
))

const summaryItems = computed(() => buildStatSummaryItems(props.total, props.filteredType))

function onClick(type: SeriesSlugSelected) {
  emit('click', type)
}
</script>

<template>
  <div class="overflow-x-auto">
    <StatSumItem
      v-if="props.type === 'summary' && props.focusedType"
      :amount="props.focusedType === 'income' ? total.income : -total.expense"
      class="w-full @2xl/stat:hidden"
      :type="props.focusedType"
      variant="summary"
      @click="onClick(props.focusedType)"
    >
      <UiButtonClose class="top-1/2 right-3 -translate-y-1/2" @click.stop="onClick(props.focusedType)" />
      <div class="mr-10 ml-auto flex w-12 shrink-0 items-center justify-center">
        <slot name="focusPie" />
      </div>
    </StatSumItem>

    <div
      v-if="props.type === 'summary'"
      :class="props.focusedType ? 'hidden @2xl/stat:flex' : 'flex'"
      class="flex-wrap gap-2 @2xl/stat:justify-start"
    >
      <StatSumItem
        v-for="item in summaryItems"
        :key="item.type"
        :amount="item.amount"
        :isActive="item.isActive"
        :class="className"
        :type="item.type"
        variant="summary"
        @click="onClick(item.type)"
      >
        <StatSumAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          :statTabSlug="item.type"
        />

        <div class="ml-auto hidden w-12 shrink-0 items-center justify-center @2xl/stat:flex">
          <slot name="summaryPie" :type="item.type" />
        </div>
      </StatSumItem>
    </div>

    <div v-else class="flex items-center justify-start">
      <StatSumItem
        :amount="props.type === 'income' ? total.income : -((total as Record<string, number>)[props.type]!)"
        class="w-full"
        :class="className"
        :type="(props.type as SeriesSlugSelected)"
        :averageTotal="isShowAverage ? props.averageTotal : undefined"
        variant="summary"
        @click="emit('clickAverage')"
      >
        <StatSumAverage
          v-if="isShowAverage"
          :categoryId
          :statTabSlug="(props.type ?? 'net') as SeriesSlugSelected"
          :trnsIds
          :walletId
        />

        <div
          v-if="props.type === 'expense' || props.type === 'income'"
          class="ml-auto flex w-12 shrink-0 items-center justify-center"
        >
          <slot name="summaryPie" :type="props.type" />
        </div>
      </StatSumItem>
    </div>
  </div>
</template>
import type { TotalReturns } from '~/components/amount/getTotal'
