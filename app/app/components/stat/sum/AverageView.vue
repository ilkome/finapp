<script setup lang="ts">
import type { SeriesSlugSelected } from '~/components/stat/types'

import { getTrnTypeByAmount, TrnType } from '~/components/trns/types'

const props = defineProps<{
  amount: number
  currencyCode: string
  type: SeriesSlugSelected
}>()

const { t } = useI18n()

const amountType = computed(() => {
  if (props.type === 'net')
    return getTrnTypeByAmount(props.amount)
  return props.type === 'income' ? TrnType.Income : TrnType.Expense
})

const colorize = computed<'expense' | 'income'>(() => {
  if (props.type === 'net')
    return props.amount > 0 ? 'income' : 'expense'
  return props.type
})
</script>

<template>
  <div class="grid w-full grow gap-1">
    <UiText class="leading-3! text-nowrap" variant="caption">
      {{ t('money.average') }}
      <br>{{ t('stat.average.forLast') }}
    </UiText>

    <Amount
      :amount="props.amount"
      :colorize
      :currencyCode="props.currencyCode"
      :type="amountType"
      align="left"
      variant="default"
    />
  </div>
</template>
