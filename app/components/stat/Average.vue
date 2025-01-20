<script setup lang="ts">
// import { useStorage } from '@vueuse/core'
import { sub } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/filter/types'
import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getEndOf, getStartOf } from '~/components/date/utils'
// import { useGetDateRange } from '~/components/stat/date/useGetDateRange'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  averageConfig: number
  categoryId?: CategoryId
  filter: FilterProvider
  statDate: StatDateProvider
  statTabSlug: StatTabSlug
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

// const { locale, t } = useI18n()
// const { getStringDateRange } = useGetDateRange(t, locale.value)

const total = computed(() => getTotalOfTrnsIds(datedTrnsIds.value))

// const last = computed(() => {
//   const rangeBy = props.statDate.params.value.rangeBy
//   const value = props.averageConfig * props.statDate.params.value.rangeDuration
//   return `${value} ${t(`dates.${rangeBy}.plural`, value)}`
// })
</script>

<template>
  <div class="grid gap-4">
    <div class="grid w-full grow gap-1">
      <!-- <UiTitle6 class="text-nowrap !leading-3">
        {{ t('money.average') }}
        <br>{{ t('forLast') }} {{ last }}
        <br>{{ getStringDateRange(dates, props.statDate.params.value.rangeBy, props.statDate.params.value.rangeDuration) }}
      </UiTitle6> -->

      <UiTitle6 class="text-nowrap !leading-3">
        {{ t('money.average') }}
        <br>{{ t('forLast') }}
      </UiTitle6>

      <div class="flex gap-4">
        <Amount
          v-if="statTabSlug === 'income'"
          :amount="total.income / props.averageConfig"
          :currencyCode="currenciesStore.base"
          :type="1"
          align="left"
          colorize="income"
          variant="base"
        />
        <Amount
          v-if="statTabSlug === 'expense'"
          :amount="total.expense / props.averageConfig"
          :currencyCode="currenciesStore.base"
          :type="0"
          align="left"
          colorize="expense"
          variant="base"
        />
        <Amount
          v-if="statTabSlug === 'netIncome'"
          :amount="total.sum / props.averageConfig"
          :colorize="total.sum > 0 ? 'income' : 'expense'"
          :currencyCode="currenciesStore.base"
          :type="total.sum > 0 ? 1 : 0"
          align="left"
          variant="base"
        />
      </div>
    </div>

    <!-- <div class="flex gap-1">
      <UiItem2
        :class="[{
          '!hocus:transparent opacity-30': props.averageConfig === 1,
        }]"
        @click="props.averageConfig = props.averageConfig - 1"
      >
        <Icon name="lucide:minus" />
      </UiItem2>
      <FormInput
        :value="props.averageConfig"
        :max="100"
        min="1"
        class="min-w-16 max-w-20 !px-2 text-center"
        type="number"
        @updateValue="value => props.averageConfig = Number(value)"
      />
      <UiItem2
        :class="{ '!hocus:transparent opacity-30': props.averageConfig >= 100 }"
        @click="props.averageConfig = props.averageConfig + 1"
      >
        <Icon name="lucide:plus" />
      </UiItem2>
    </div> -->
  </div>
</template>

<i18n lang="yaml">
en:
  forLast: for the last periods
ru:
  forLast: за прошлые периоды
</i18n>
