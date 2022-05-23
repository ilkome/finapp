<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { $store } = useNuxtApp()
const { height } = useWindowSize()

function onSelect(value, close) {
  $store.dispatch('currencies/setBaseCurrency', value)
  close()
}
</script>

<template lang="pug">
Portal(
  v-if="$store.state.currencies.modal.show"
  to="modal"
)
  BaseBottomSheet(
    :maxHeight="height"
    :height="height"
    :isScrollerBlock="false"
    insideClass="bg-skin-layout-main"
    @closed="$store.commit('currencies/hideBaseCurrenciesModal')"
  )
    template(#handler="{ close }")
      BaseBottomSheetHandler
      BaseBottomSheetClose(@onClick="close")

    template(#header)
      .py-4.px-2.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold.bg-skin-layout-main.rounded-t-2xl
        | {{ $t('currency.selectBaseTitle') }}

    template(#default="{ close }")
      CurrenciesList(
        :active="$store.state.currencies.base"
        @onSelect="value => onSelect(value, close)"
      )
</template>
