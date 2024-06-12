<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()

function onSelect(code: CurrencyCode, close: () => void) {
  currenciesStore.updateBase(code)
  close()
}
</script>

<template>
  <Teleport v-if="currenciesStore.isShownModal" to="body">
    <BaseBottomSheet2
      isShow
      drugClassesCustom="max-w-sm mx-auto bg-foreground-2"
      @closed="currenciesStore.hideBaseCurrenciesModal()"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <UiTitle>{{ t('select') }}</UiTitle>
        <CurrenciesList
          :active="currenciesStore.base"
          @onSelect="c => onSelect(c, close)"
        />
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>

<i18n lang="yaml">
  en:
    select: Select base currency

  ru:
    select: Выбрать основную валюту
</i18n>
