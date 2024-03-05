<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { CurrencyCode } from '~/components/currencies/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

const currenciesStore = useCurrenciesStore()
const { height } = useWindowSize()

function onSelect(code: CurrencyCode, close: () => void) {
  currenciesStore.updateBase(code)
  close()
}
</script>

<template lang="pug">
Teleport(
  v-if="currenciesStore.isShownModal"
  to="body"
)
  BaseBottomSheet(
    :maxHeight="height"
    :height="height"
    :isScrollerBlock="false"
    insideClass="bg-foreground-3"
    @closed="currenciesStore.hideBaseCurrenciesModal()"
  )
    template(#handler="{ close }")
      BaseBottomSheetHandler
      BaseBottomSheetClose(@onClick="close")

    template(#header)
      .py-4.px-2.text-center.text-item-base.text-xl.font-primary.font-semibold.bg-foreground-3.rounded-t-2xl
        | {{ $t('currency.selectBaseTitle') }}

    template(#default="{ close }")
      CurrenciesList(
        :active="currenciesStore.base"
        @onSelect="value => onSelect(value, close)"
      )
</template>
