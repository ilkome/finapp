<script setup lang="ts">
import type { SeriesSlugSelected } from '~/components/stat/types'

import { getTrnTypeByAmount } from '~/components/trns/types'

const props = defineProps<{
  amount: number
  currencyCode: string
  label?: string
  type: SeriesSlugSelected
}>()

const { t } = useI18n()

const amountType = computed(() => {
  if (props.type === 'net')
    return getTrnTypeByAmount(props.amount)
  return props.type === 'income' ? 'income' : 'expense'
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
      <template v-if="props.label">
        {{ props.label }}
      </template>
      <template v-else>
        {{ t('money.average') }}
        <br>{{ t('stat.average.forLast') }}
      </template>
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
