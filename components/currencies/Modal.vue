<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { CurrencyCode } from '~/components/currencies/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const { height } = useWindowSize()

function onSelect(code: CurrencyCode, close: () => void) {
  currenciesStore.updateBase(code)
  close()
}
</script>

<template>
  <Teleport v-if="currenciesStore.isShownModal" to="body">
    <BaseBottomSheet
      :maxHeight="height"
      :height="height"
      :isScrollerBlock="false"
      insideClass="bg-foreground-3"
      @closed="currenciesStore.hideBaseCurrenciesModal()"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #header>
        <div
          class="text-item-base rounded-t-2xl bg-foreground-3 px-2 py-4 text-center font-primary text-xl font-semibold"
        >
          {{ t("select") }}
        </div>
      </template>

      <template #default="{ close }">
        <CurrenciesList
          :active="currenciesStore.base"
          @onSelect="c => onSelect(c, close)"
        />
      </template>
    </BaseBottomSheet>
  </Teleport>
</template>

<i18n lang="yaml">
  en:
    select: Select base currency

  ru:
    select: Выбрать основную валюту
</i18n>
