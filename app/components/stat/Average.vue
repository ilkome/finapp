<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { sub } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/filter/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getEndOf, getStartOf } from '~/components/date/utils'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoryId?: CategoryId
  filter: FilterProvider
  statDate: StatDateProvider
  trnsIds: TrnId[]
  walletId?: WalletId
}>()

const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()

const averageConfig = useStorage('averageConfig', {
  count: 1,
})

const untilDate = computed(() => getEndOf(sub(new Date(), { [`${props.statDate.params.value.rangeBy}s`]: props.statDate.params.value.rangeDuration }), props.statDate.params.value.rangeBy))

const dates = computed<Range>(() => ({
  end: untilDate.value.getTime(),
  start: getStartOf(sub(untilDate.value, { [`${props.statDate.params.value.rangeBy}s`]: (props.statDate.params.value.rangeDuration * averageConfig.value.count) - 1 }), props.statDate.params.value.rangeBy).getTime(),
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

const { locale, t } = useI18n()
const { getStringDateRange } = useGetDateRange(t, locale.value)

const total = computed(() => getTotalOfTrnsIds(datedTrnsIds.value))

const last = computed(() => {
  const rangeBy = props.statDate.params.value.rangeBy
  const rangeDuration = props.statDate.params.value.rangeDuration
  const count = averageConfig.value.count

  const getCount = () => {
    const value = count * rangeDuration
    return `${value} ${t(`dates.${rangeBy}.plural`, value)}`
  }

  const periods = {
    day: { count: getCount() },
    month: { count: getCount() },
    week: { count: getCount() },
    year: { count: getCount() },
  }

  return periods[rangeBy]
})
</script>

<template>
  <div class="flex items-start gap-4 pb-2 pl-3 md:max-w-lg">
    <div class="grid w-full grow gap-1 pb-[2px]">
      <UiTitle6 class="text-nowrap !leading-3">
        {{ t('money.average') }}
        <br>{{ t('for') }} ~{{ last.count }}
        <br>{{ getStringDateRange(dates, props.statDate.params.value.rangeBy, props.statDate.params.value.rangeDuration) }}
      </UiTitle6>

      <div class="flex gap-4 overflow-x-auto pb-2">
        <Amount
          :amount="total.income / averageConfig.count"
          :currencyCode="currenciesStore.base"
          :type="1"
          align="left"
          colorize="income"
          variant="xl"
        />
        <Amount
          :amount="total.expense / averageConfig.count"
          :currencyCode="currenciesStore.base"
          :type="0"
          align="left"
          colorize="expense"
          variant="xl"
        />
        <Amount
          :amount="total.sum / averageConfig.count"
          :currencyCode="currenciesStore.base"
          :type="total.sum > 0 ? 1 : 0"
          align="left"
          :colorize="total.sum > 0 ? 'income' : 'expense'"
          variant="xl"
        />
      </div>
    </div>

    <div class="flex gap-1">
      <UiItem2
        :class="[{
          '!hocus:transparent opacity-30': averageConfig.count === 1,
        }]"
        @click="averageConfig.count = averageConfig.count - 1"
      >
        <Icon name="lucide:minus" />
      </UiItem2>
      <FormInput
        :value="averageConfig.count"
        :max="100"
        min="1"
        class="min-w-16 max-w-20 !px-2 text-center"
        type="number"
        @updateValue="value => averageConfig.count = Number(value)"
      />
      <UiItem2
        :class="{ '!hocus:transparent opacity-30': averageConfig.count >= 100 }"
        @click="averageConfig.count = averageConfig.count + 1"
      >
        <Icon name="lucide:plus" />
      </UiItem2>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  for: for the last
ru:
  for: за прошлые
</i18n>
