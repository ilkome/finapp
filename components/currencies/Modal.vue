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
  <BaseBottomSheet2
    v-if="currenciesStore.isShownModal"
    isShow
    drugClassesCustom="sm:max-w-md mx-auto bg-foreground-2"
    @closed="currenciesStore.hideBaseCurrenciesModal()"
  >
    <template #handler="{ close }">
      <BaseBottomSheetHandler />
      <BaseBottomSheetClose @onClick="close" />
    </template>

    <template #default="{ close }">
      <div class="grid gap-4 py-4 px-3">
        <UiTitle3>{{ t('select') }}</UiTitle3>
        <CurrenciesList
          :active="currenciesStore.base"
          @onSelect="c => onSelect(c, close)"
        />
      </div>
    </template>
  </BaseBottomSheet2>
</template>

<i18n lang="yaml">
  en:
    select: Select base currency

  ru:
    select: Выбрать основную валюту
</i18n>
