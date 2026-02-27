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

const showAll = ref(false)
const searchInput = ref('')

watch(showAll, (value) => {
  if (!value)
    searchInput.value = ''
})

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

const list = computed(() => {
  const base = currenciesStore.base
  const usedCodes = walletsStore.currenciesUsed

  let items = showAll.value
    ? currencies.map(c => c.code)
    : usedCodes

  if (searchInput.value) {
    const search = searchInput.value.toLowerCase()
    items = items.filter((code) => {
      const info = currencyMap.get(code)
      return code.toLowerCase().includes(search)
        || info?.name.toLowerCase().includes(search)
    })
  }

  // Sort: base currency first, then alphabetically
  return items.toSorted((a, b) => {
    if (a === base)
      return -1
    if (b === base)
      return 1
    return a.localeCompare(b)
  })
})
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('currencies.page.title') }}</UiHeaderTitle>
      <template #actions>
        <UiActionButton @click="showAll = !showAll">
          <Icon
            :name="showAll ? 'lucide:filter' : 'lucide:globe'"
            size="20"
          />
        </UiActionButton>
      </template>
    </UiHeader>

    <div class="max-w-4xl grow px-2 lg:px-4 2xl:px-8">
      <!-- Toggle label -->
      <div class="flex items-center gap-3 pb-3">
        <button
          class="text-muted text-xs hover:text-(--ui-text-highlighted)"
          @click="showAll = !showAll"
        >
          {{ showAll ? t('currencies.page.showUsed') : t('currencies.page.showAll') }}
        </button>
      </div>

      <!-- Search (only when showing all) -->
      <div v-if="showAll" class="pb-3">
        <FormInput
          v-model="searchInput"
          :placeholder="`${t('currencies.list.search')}...`"
        />
      </div>

      <!-- Empty -->
      <div
        v-if="list.length === 0"
        class="text-muted py-6 text-center text-sm"
      >
        {{ t('currencies.list.notFound') }}
      </div>

      <!-- List -->
      <div v-else>
        <CurrenciesItem
          v-for="code in list"
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
