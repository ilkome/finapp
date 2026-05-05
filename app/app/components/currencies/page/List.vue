<script setup lang="ts">
import { currencies } from '~/components/currencies/currencies'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useCurrencyName } from '~/components/currencies/useCurrencyName'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const userStore = useUserStore()
const walletsStore = useWalletsStore()
const { getCurrencyName } = useCurrencyName()

useHead({ title: t('currencies.page.title') })

const searchInput = ref('')
const activeTab = ref<'fiat' | 'crypto'>('fiat')

const currencyMap = new Map(
  currencies.map(c => [c.code, { symbol: c.symbol }]),
)

// Fiat detection: Intl.DisplayNames knows ISO 4217 codes and returns
// a translated name for fiat, but returns the code itself for unknown (crypto)
const intlCurrencyNames = new Intl.DisplayNames('en', { type: 'currency' })
function isFiatCode(code: string): boolean {
  try {
    const name = intlCurrencyNames.of(code)
    return name !== undefined && name !== code
  }
  catch {
    return false
  }
}

function getRate(code: string): number | undefined {
  const base = currenciesStore.base
  const rates = currenciesStore.rates
  if (!base || !rates || code === base)
    return undefined

  const baseRate = rates[base] || 1
  const codeRate = rates[code] || 1
  return baseRate / codeRate
}

function sortCurrencies(items: string[]): string[] {
  const base = currenciesStore.base
  return items.toSorted((a, b) => {
    if (a === base)
      return -1
    if (b === base)
      return 1
    return a.localeCompare(b)
  })
}

function filterBySearch(items: string[]): string[] {
  if (!searchInput.value)
    return items

  const search = searchInput.value.toLowerCase()
  return items.filter((code) => {
    return code.toLowerCase().includes(search)
      || getCurrencyName(code).toLowerCase().includes(search)
  })
}

const usedList = computed(() => {
  return sortCurrencies(filterBySearch(walletsStore.currenciesUsed))
})

const allRateCodes = computed(() => {
  return Object.keys(currenciesStore.rates)
})

const fiatList = computed(() => {
  const usedSet = new Set(walletsStore.currenciesUsed)
  const items = allRateCodes.value.filter(code => isFiatCode(code) && !usedSet.has(code))
  return sortCurrencies(filterBySearch(items))
})

const cryptoList = computed(() => {
  const usedSet = new Set(walletsStore.currenciesUsed)
  const items = allRateCodes.value.filter(code => !isFiatCode(code) && !usedSet.has(code))
  return sortCurrencies(filterBySearch(items))
})

const activeList = computed(() => {
  return activeTab.value === 'fiat' ? fiatList.value : cryptoList.value
})
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('currencies.page.title') }}</UiHeaderTitle>
    </UiHeader>

    <div class="max-w-4xl grow px-2 lg:px-4 2xl:px-8">
      <FormInput
        v-model="searchInput"
        :placeholder="`${t('currencies.list.search')}...`"
        class="pb-3"
      />

      <!-- Used currencies -->
      <UiTitleCollapse isHideArrow>
        {{ t('currencies.page.showUsed') }}
      </UiTitleCollapse>

      <div v-if="usedList.length === 0" class="text-muted py-6 text-center text-sm">
        {{ t('currencies.list.notFound') }}
      </div>

      <div v-else>
        <CurrenciesItem
          v-for="code in usedList"
          :key="code"
          :code="code"
          :isBase="code === currenciesStore.base"
          :name="getCurrencyName(code)"
          :rate="getRate(code)"
          :symbol="currencyMap.get(code)?.symbol"
          @setBase="userStore.saveUserBaseCurrency"
        />
      </div>

      <!-- Fiat / Crypto tabs -->
      <UiTabsScroll class="mt-4 mb-2">
        <UiTabsItemPill
          :isActive="activeTab === 'fiat'"
          variant="outline"
          @click="activeTab = 'fiat'"
        >
          {{ t('currencies.page.fiat') }}
        </UiTabsItemPill>

        <UiTabsItemPill
          :isActive="activeTab === 'crypto'"
          variant="outline"
          @click="activeTab = 'crypto'"
        >
          {{ t('currencies.page.crypto') }}
        </UiTabsItemPill>
      </UiTabsScroll>

      <div v-if="activeList.length === 0" class="text-muted py-6 text-center text-sm">
        {{ t('currencies.list.notFound') }}
      </div>

      <div v-else>
        <CurrenciesItem
          v-for="code in activeList"
          :key="code"
          :code="code"
          :isBase="code === currenciesStore.base"
          :name="getCurrencyName(code)"
          :rate="getRate(code)"
          :symbol="currencyMap.get(code)?.symbol"
          @setBase="userStore.saveUserBaseCurrency"
        />
      </div>
    </div>
  </UiPage>
</template>
