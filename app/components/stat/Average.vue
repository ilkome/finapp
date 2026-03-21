<script setup lang="ts">
import { sub } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { Range } from '~/components/date/types'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getEndOf, getStartOf, toDuration } from '~/components/date/utils'
import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { getTrnTypeByAmount, TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoryId?: CategoryId
  statTabSlug: SeriesSlugSelected
  trnsIds: TrnId[]
  walletId?: WalletId
}>()

const { t } = useI18n()
const filter = inject(filterKey)!
const statConfig = inject(statConfigKey)!
const statDate = inject(statDateKey)!
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const { computeTotalForTrnsIds } = useAmount()

const averageConfig = computed(() => statConfig.config.value.statAverage.count)

const untilDate = computed(() => getEndOf(sub(new Date(), toDuration(statDate.params.value.rangeBy, statDate.params.value.rangeDuration)), statDate.params.value.rangeBy))

const dates = computed<Range>(() => ({
  end: untilDate.value.getTime(),
  start: getStartOf(sub(untilDate.value, toDuration(statDate.params.value.rangeBy, (statDate.params.value.rangeDuration * averageConfig.value) - 1)), statDate.params.value.rangeBy).getTime(),
}))

const datedTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: props.categoryId ? [...filter.categoriesIds.value, props.categoryId] : filter.categoriesIds.value,
  dates: {
    end: dates.value.end,
    start: dates.value.start,
  },
  walletsIds: props.walletId ? [...(filter.walletsIds.value ?? []), props.walletId] : filter.walletsIds.value,
}))

const total = computed(() => computeTotalForTrnsIds(datedTrnsIds.value))

const averageAmount = computed(() => {
  if (props.statTabSlug === 'income')
    return total.value.income / averageConfig.value
  if (props.statTabSlug === 'expense')
    return total.value.expense / averageConfig.value
  return total.value.sum / averageConfig.value
})

const amountType = computed(() => {
  if (props.statTabSlug === 'netIncome')
    return getTrnTypeByAmount(averageAmount.value)
  return props.statTabSlug === 'income' ? TrnType.Income : TrnType.Expense
})

const amountColorize = computed(() => {
  if (props.statTabSlug === 'netIncome')
    return averageAmount.value > 0 ? 'income' : 'expense'
  return props.statTabSlug as 'expense' | 'income'
})
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
          :amount="averageAmount"
          :colorize="amountColorize"
          :currencyCode="currenciesStore.base"
          :type="amountType"
          align="left"
          variant="base"
        />
      </div>
    </div>
  </div>
</template>
