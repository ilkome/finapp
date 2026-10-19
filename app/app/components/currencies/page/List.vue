<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { convert } from '~~/utils/money/convert'

import type { CurrencyRow } from '~/components/currencies/PageListView.vue'
import type { CurrencyCode, CurrencyItem } from '~/components/currencies/types'

import { amountToMinor, formatAmount, getCurrencySymbol, scaleOf } from '~/components/amount/utils'
import { isBuiltInCurrency } from '~/components/currencies/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useCurrencyOptions } from '~/components/currencies/useCurrencyOptions'
import { evaluateExpression } from '~/components/trnForm/utils/calculate'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const userStore = useUserStore()
const walletsStore = useWalletsStore()
const { getCurrencyName, options } = useCurrencyOptions()

useHead({ title: t('currencies.page.title') })

function formatRate(rate: number): string {
  return rate.toFixed(rate < 0.01 ? 6 : rate < 1 ? 4 : 2)
}

const rows = computed<CurrencyRow[]>(() => options.value.map(({ code, name }) => {
  const own = currenciesStore.items[code]
  const rate = convert(10 ** scaleOf(code), code, currenciesStore.base, currenciesStore.rates, scaleOf)
  return {
    code,
    isBase: code === currenciesStore.base,
    isCustom: !isBuiltInCurrency(code),
    isManualRate: own?.manualRate !== undefined,
    isOwn: !!own,
    minorDisplay: own?.minorDisplay ?? 'auto',
    name,
    rate: rate === undefined ? null : formatRate(rate / 10 ** scaleOf(currenciesStore.base)),
    symbol: getCurrencySymbol(code) === code ? undefined : getCurrencySymbol(code),
  }
}))

// Edit / add
const editing = ref<{ code: CurrencyCode, isNew: boolean } | null>(null)
const editingValue = computed<CurrencyItem>(() => editing.value
  ? currenciesStore.items[editing.value.code] ?? { code: editing.value.code }
  : { code: '' })
const usedByWallets = computed(() => editing.value
  ? Object.values(walletsStore.items ?? {}).filter(w => w.currencyCode === editing.value!.code).map(w => w.name)
  : [])

async function onSave(item: CurrencyItem, close: () => void) {
  if (await currenciesStore.saveCurrency(item))
    close()
}

async function onDelete(close: () => void) {
  if (editing.value && !usedByWallets.value.length && await currenciesStore.deleteCurrency(editing.value.code))
    close()
}

// Converter: device state (rule 5)
const converterSource = useStorage<CurrencyCode>('finapp.converter.source', '')
const converterTargets = useStorage<CurrencyCode[] | null>('finapp.converter.targets', null)
const converterAmount = ref('100')

const source = computed(() => converterSource.value || currenciesStore.base)
const targets = computed(() => (converterTargets.value ?? walletsStore.currenciesUsed).filter(code => code !== source.value))
const results = computed(() => {
  const amount = amountToMinor(evaluateExpression(converterAmount.value), source.value)
  return targets.value.map((code) => {
    const value = convert(amount, source.value, code, currenciesStore.rates, scaleOf)
    return { code, value: value === undefined ? null : `${formatAmount(Math.round(value), code)} ${getCurrencySymbol(code)}` }
  })
})

function setTargets(codes: CurrencyCode[]) {
  converterTargets.value = codes
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('currencies.page.title') }}</UiHeaderTitle>
    </UiHeader>

    <div class="grid max-w-4xl grow grid-cols-1 gap-6 px-2 lg:px-4 2xl:px-8">
      <section class="grid grid-cols-1 gap-2">
        <UiTitleSection>{{ t('currencies.converter.title') }}</UiTitleSection>
        <CurrenciesConverterView
          :amount="converterAmount"
          :options
          :ratesDate="currenciesStore.ratesDate"
          :results
          :source
          @update:amount="converterAmount = $event"
          @update:source="converterSource = $event"
          @addTarget="setTargets([...targets, $event])"
          @removeTarget="code => setTargets(targets.filter(c => c !== code))"
        />
      </section>

      <section class="grid grid-cols-1 gap-2">
        <UiTitleSection>{{ t('currencies.page.title') }}</UiTitleSection>
        <CurrenciesPageListView
          :rows
          @add="editing = { code: '', isNew: true }"
          @edit="code => editing = { code, isNew: false }"
          @setBase="userStore.saveUserBaseCurrency"
        />
      </section>
    </div>

    <Drawer
      v-if="editing"
      :title="editing.isNew ? t('currencies.form.add') : `${editing.code} - ${getCurrencyName(editing.code)}`"
      @closed="editing = null"
    >
      <template #default="{ close }">
        <CurrenciesEditView
          :defaults="{ name: getCurrencyName(editing.code), symbol: getCurrencySymbol(editing.code) }"
          :isBuiltIn="!editing.isNew && isBuiltInCurrency(editing.code)"
          :isNew="editing.isNew"
          :rateCurrencies="options"
          :usedByWallets
          :value="editingValue"
          @save="item => onSave(item, close)"
          @reset="editing && currenciesStore.deleteCurrency(editing.code).then(close)"
          @delete="onDelete(close)"
        />
      </template>
    </Drawer>
  </UiPage>
</template>
