<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilterStore } from '~/components/filter/useFilterStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { getStyles } from '~/components/ui/getStyles'
import type { CurrencyCode } from '~/components/currencies/types'

const { $i18n } = useNuxtApp()
const { t } = useI18n()
useSeoMeta({
  title: $i18n.t('wallets.name'),
})

const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const { isModalOpen, openModal } = useAppNav()
const { setWalletId } = useFilterStore()

const currencyFiltered = useStorage('finapp-wallets-active-currency', 'all')
const activeType = useStorage('finapp-wallets-active-type', 'all')

const selectedWallets = computed(() => {
  if (currencyFiltered.value === 'all' && activeType.value === 'all')
    return walletsStore.sortedItems

  return Object.fromEntries(
    Object.entries(walletsStore.sortedItems).filter(
      ([_key, wallet]) => {
        if (currencyFiltered.value === 'all') {
          if (activeType.value === 'all')
            return true

          if (activeType.value === 'isCredit' && wallet.isCredit) {
            return true
          }

          if (activeType.value === 'isSaving' && !wallet.withdrawal) {
            return true
          }

          if (activeType.value === 'withdrawal' && wallet.withdrawal) {
            return true
          }
          if (activeType.value === 'isDeposit' && wallet.isDeposit) {
            return true
          }

          if (activeType.value === 'isCashless' && wallet.isCashless)
            return true

          if (activeType.value === 'isCash' && wallet.isCash)
            return true

          if (activeType.value === 'creditPossible' && wallet.creditLimit)
            return true

          if (activeType.value === 'withCredit' && !wallet.isCredit)
            return true
        }

        if (currencyFiltered.value === wallet.currency) {
          if (activeType.value === 'all')
            return true

          if (activeType.value === 'isCashless' && wallet.isCashless)
            return true

          if (activeType.value === 'isCash' && wallet.isCash)
            return true

          if (activeType.value === 'isCredit' && wallet.isCredit)
            return true

          if (activeType.value === 'isSaving' && !wallet.withdrawal)
            return true

          if (activeType.value === 'withdrawal' && wallet.withdrawal) {
            return true
          }
          if (activeType.value === 'isDeposit' && wallet.isDeposit) {
            return true
          }
          if (activeType.value === 'creditPossible' && wallet.creditLimit)
            return true
          if (activeType.value === 'withCredit' && !wallet.isCredit)
            return true
        }

        return false
      },
    ),
  )
})

const selectedWallets2 = computed(() => {
  if (currencyFiltered.value === 'all')
    return walletsStore.sortedItems

  return Object.fromEntries(
    Object.entries(walletsStore.sortedItems).filter(
      ([_key, wallet]) => {
        if (currencyFiltered.value === wallet.currency)
          return true

        return false
      },
    ),
  )
})

const walletsCurrenciesTabs = reactive({
  currencyCode: computed(() => {
    if (currencyFiltered.value === 'all')
      return currenciesStore.base
    return currencyFiltered.value
  }),

  onSelect: (v) => {
    currencyFiltered.value = v
  },
})

const isShowCurrencyFilter = ref(false)
function onSelectFilterCurrency(code: CurrencyCode) {
  walletsCurrenciesTabs.onSelect(code)
  isShowCurrencyFilter.value = false
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle2>{{ $t("wallets.name") }}</UiHeaderTitle2>
      <template #actions>
        <UiHeaderLink @click="openModal('walletsSort')">
          <UiIconOrder class="size-5" />
        </UiHeaderLink>
        <UiHeaderLink @click="$router.push('/wallets/new')">
          <UiIconAdd class="size-5" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div v-if="walletsStore.currenciesUsed.length > 1">
      <CurrenciesModal
        v-if="currenciesStore.isShownModal"
        :activeCode="currenciesStore.base"
        @onSelect="currenciesStore.setBase"
        @onClose="currenciesStore.hideBaseCurrenciesModal"
      />

      <CurrenciesModal
        v-if="isShowCurrencyFilter"
        isShowAll
        :activeCode="currencyFiltered"
        @onSelect="onSelectFilterCurrency"
        @onClose="isShowCurrencyFilter = false"
      />
    </div>

    <div class="grid md:grid-cols-2 md:gap-12 px-2 md:px-6 max-w-3xl">
      <div class="md:order-1">
        <div
          v-if="walletsStore.currenciesUsed.length > 1"
          class="grid md:hidden grid-cols-2 gap-2"
        >
          <UiBox1 @click="isShowCurrencyFilter = true">
            <UiTitle6>{{ t('filterByCurrency') }}</UiTitle6>
            {{ currencyFiltered === 'all' ? t("all") : currencyFiltered }}
          </UiBox1>

          <UiBox1 @click="currenciesStore.showBaseCurrenciesModal()">
            <UiTitle6>{{ t('currenciesBase') }}</UiTitle6>
            {{ currenciesStore.base }}
          </UiBox1>
        </div>

        <WalletsTotal
          :activeType
          :currencyCode="currenciesStore.base"
          :walletsItems="selectedWallets2"
          class="pb-2"
          @click="v => activeType = v"
        />

        <UiBox1
          class="hidden md:grid"
          @click="currenciesStore.showBaseCurrenciesModal()"
        >
          <UiTitle6>{{ t('currenciesBase') }}</UiTitle6>
          {{ currenciesStore.base }}
        </UiBox1>
      </div>

      <div class="md:max-w-sm">
        <!-- Wallets Currencies -->
        <UiToggle
          v-if="walletsStore.currenciesUsed.length > 1"
          :initStatus="true"
          :openPadding="1"
          class="md:max-w-xl"
          storageKey="finapp-wallets-currencies"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle7 @click="toggle">
              <div>{{ t('filterByCurrency') }}</div>
              <Icon
                v-if="!isShown"
                name="mdi:chevron-down"
                size="22"
                class="-ml-1"
              />
            </UiTitle7>
          </template>

          <UiTabs>
            <UiTabsItem
              :isActive="currencyFiltered === 'all'"
              @click="walletsCurrenciesTabs.onSelect('all')"
            >
              {{ t("all") }}
            </UiTabsItem>

            <UiTabsItem
              v-for="currency in walletsStore.currenciesUsed"
              :key="currency"
              :isActive="currencyFiltered === currency"
              @click="walletsCurrenciesTabs.onSelect(currency)"
            >
              {{ currency }}
            </UiTabsItem>
          </UiTabs>
        </UiToggle>

        <WalletsItem
          v-for="(walletItem, walletId) in selectedWallets"
          :key="walletId"
          :wallet="walletItem"
          :walletId
          :lineWidth="2"
          isShowBaseRate
          isShowIcons
          class="group"
          @click="$router.push(`/wallets/${walletId}`)"
          @filter="setWalletId(walletId)"
        />
      </div>
    </div>
  </UiPage>

  <!-- Sort -->
  <WalletsSortModal v-if="isModalOpen('walletsSort')" />
</template>

<i18n lang="yaml">
en:
  all: All
  filterByCurrency: Filter by
  currenciesBase: Base currency

ru:
  all: Все
  filterByCurrency: Валюты кошельков
  currenciesBase: Основная валюта
</i18n>
