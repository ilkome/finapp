<script setup lang="ts">
import { currencies } from '~/components/currencies/currencies'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const currenciesStore = useCurrenciesStore()
const userStore = useUserStore()
const walletsStore = useWalletsStore()

useHead({ title: t('currencies.page.title') })

const searchInput = ref('')

const currencyMap = new Map(
  currencies.map(c => [c.code, { name: c.name, symbol: c.symbol }]),
)

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
    const info = currencyMap.get(code)
    return code.toLowerCase().includes(search)
      || info?.name.toLowerCase().includes(search)
  })
}

const usedList = computed(() => {
  return sortCurrencies(filterBySearch(walletsStore.currenciesUsed))
})

const allList = computed(() => {
  const usedSet = new Set(walletsStore.currenciesUsed)
  const items = currencies.map(c => c.code).filter(code => !usedSet.has(code))
  return sortCurrencies(filterBySearch(items))
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
          :name="currencyMap.get(code)?.name ?? code"
          :rate="getRate(code)"
          :symbol="currencyMap.get(code)?.symbol"
          @setBase="userStore.saveUserBaseCurrency"
        />
      </div>

      <!-- All currencies -->
      <UiTitleCollapse isHideArrow>
        {{ t('currencies.page.showAll') }}
      </UiTitleCollapse>

      <div v-if="allList.length === 0" class="text-muted py-6 text-center text-sm">
        {{ t('currencies.list.notFound') }}
      </div>

      <div v-else>
        <CurrenciesItem
          v-for="code in allList"
          :key="code"
          :code="code"
          :isBase="code === currenciesStore.base"
          :name="currencyMap.get(code)?.name ?? code"
          :rate="getRate(code)"
          :symbol="currencyMap.get(code)?.symbol"
          @setBase="userStore.saveUserBaseCurrency"
        />
      </div>
    </div>
  </UiPage>
</template>
