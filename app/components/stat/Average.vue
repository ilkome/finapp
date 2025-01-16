<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { formatDuration, intervalToDuration, sub } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { Range, StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/filter/types'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getEndOf, getStartOf } from '~/components/date/utils'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  filter: FilterProvider
  statDate: StatDateProvider
  trnsIds: TrnId[]
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
  dates: {
    from: dates.value.start,
    until: dates.value.end,
  },
}))

const { locale, t } = useI18n()
const { getStringDateRange } = useGetDateRange(t, locale.value)

const total = computed(() => getTotalOfTrnsIds(datedTrnsIds.value))
</script>

<template>
  <div class="flex gap-4 px-3 pb-4">
    <div class="grid w-full grow gap-1 pb-[2px]">
      <UiTitle6 class="text-nowrap">
        {{ t('money.average') }}
        <br>{{ t('for') }} {{ formatDuration(intervalToDuration(dates), { format: ['months', 'weeks', 'days'], locale: locale === 'ru' ? ru : {} }) }}
        <br>{{ getStringDateRange(dates, props.statDate.params.value.rangeBy, props.statDate.params.value.rangeDuration) }}
        <!-- {{ averageConfig.count * props.statDate.params.value.rangeDuration }} {{ props.statDate.params.value.rangeBy }} -->
      </UiTitle6>

      <Amount
        :amount="total.sum / averageConfig.count"
        :currencyCode="currenciesStore.base"
        :type="0"
        align="left"
        colorize="expense"
        variant="xl"
      />
    </div>

    <FormInput
      :value="averageConfig.count"
      class="!w-auto"
      type="number"
      @updateValue="v => averageConfig.count = Number(v)"
    />
  </div>
</template>

<i18n lang="yaml">
en:
  for: for the last
ru:
  for: за предыдущие
</i18n>
