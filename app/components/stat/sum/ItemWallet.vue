<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  amount: number
  currencyCode?: string
  isActive?: boolean
  title?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    :class="[getStyles('item', ['center', 'minh1', 'minw1'])]"
    class="grid grow-0 gap-1 py-1 lg:gap-1"
    @click="(e: Event) => emit('click', e)"
  >
    <UiTitle6>{{ props.title }}</UiTitle6>

    <Amount
      :amount="props.amount"
      :currencyCode="props.currencyCode || currenciesStore.base"
      align="left"
      variant="xl"
    />
  </div>
</template>
