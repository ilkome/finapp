<script setup lang="ts">
import { sub } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getEndOf, getStartOf } from '~/components/date/utils'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  averageConfig: number
  categoryId?: CategoryId
  filter: FilterProvider
  statDate: StatDateProvider
  statTabSlug: SeriesSlugSelected
  trnsIds: TrnId[]
  walletId?: WalletId
}>()

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()

const untilDate = computed(() => getEndOf(sub(new Date(), { [`${props.statDate.params.value.rangeBy}s`]: props.statDate.params.value.rangeDuration }), props.statDate.params.value.rangeBy))

const dates = computed<Range>(() => ({
  end: untilDate.value.getTime(),
  start: getStartOf(sub(untilDate.value, { [`${props.statDate.params.value.rangeBy}s`]: (props.statDate.params.value.rangeDuration * props.averageConfig) - 1 }), props.statDate.params.value.rangeBy).getTime(),
}))

const datedTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.categoryId ? [...props.filter.categoriesIds.value, props.categoryId] : props.filter.categoriesIds.value,
  dates: {
    from: dates.value.start,
    until: dates.value.end,
  },
  walletsIds: props.walletId ? [...(props.filter.walletsIds.value ?? []), props.walletId] : props.filter.walletsIds.value,
}, {
  includesChildCategories: true,
}))

const total = computed(() => getTotalOfTrnsIds(datedTrnsIds.value))
</script>

<template>
  <div class="grid gap-4">
    <div class="grid w-full grow gap-1">
      <UiTextSubtitle class="!leading-3 text-nowrap">
        {{ t('money.average') }}
        <br>{{ t('stat.average.forLast') }}
      </UiTextSubtitle>

      <div class="flex gap-4">
        <Amount
          v-if="statTabSlug === 'income'"
          :amount="total.income / props.averageConfig"
          :currencyCode="currenciesStore.base"
          :type="TrnType.Income"
          align="left"
          colorize="income"
          variant="base"
        />
        <Amount
          v-if="statTabSlug === 'expense'"
          :amount="total.expense / props.averageConfig"
          :currencyCode="currenciesStore.base"
          :type="TrnType.Expense"
          align="left"
          colorize="expense"
          variant="base"
        />
        <Amount
          v-if="statTabSlug === 'netIncome'"
          :amount="total.sum / props.averageConfig"
          :colorize="total.sum > 0 ? 'income' : 'expense'"
          :currencyCode="currenciesStore.base"
          :type="total.sum > 0 ? TrnType.Income : TrnType.Expense"
          align="left"
          variant="base"
        />
      </div>
    </div>
  </div>
</template>
