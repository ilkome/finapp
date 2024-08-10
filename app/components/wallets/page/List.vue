<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilterStore } from '~/components/filter/useFilterStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId } from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'

const { $i18n } = useNuxtApp()
const { t } = useI18n()

useSeoMeta({
  title: $i18n.t('wallets.name'),
})

const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const { isModalOpen, openModal } = useAppNav()
const { setWalletId } = useFilterStore()
const { getAmountInBaseRate } = useAmount()

const currencyFiltered = useStorage('finapp-wallets-active-currency', 'all')
const activeType = useStorage('finapp-wallets-active-type', 'all')

function setActiveType(v: string) {
  if (activeType.value === v) {
    activeType.value = 'all'
    return
  }

  activeType.value = v
}

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

          if (activeType.value === 'savings' && !wallet.withdrawal) {
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

          if (activeType.value === 'savings' && !wallet.withdrawal)
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

const isShowCurrencyFilter = ref(false)
function onSelectFilterCurrency(code: CurrencyCode, toggle?: () => void) {
  if (currencyFiltered.value === code && toggle)
    toggle()

  // walletsCurrenciesTabs.onSelect(code)
  // if (selectedWallets.value.length === 0)
  //   return
  activeType.value = 'all'
  currencyFiltered.value = code
  isShowCurrencyFilter.value = false
}

const views = [
  'withCredit',
  'creditPossible',
  'savings',
]

const types = [
  'available',
  'withdrawal',
  'isCash',
  'isCashless',
  'isDeposit',
  'isCredit',
  'isDebt',
  'archived',
]

const groupedWallets = computed(() => {
  const grouped: Record<string, WalletId[]> = {}
  for (const type of types) {
    grouped[type] = walletsStore.sortedIds.filter((id) => {
      const isCurrencyFiltered = currencyFiltered.value === 'all' ? true : walletsStore.items[id]?.currency === currencyFiltered.value
      const isArchived = type !== 'archived' && walletsStore.items[id].archived

      if (type === 'available') {
        const wallet = (walletsStore.items[id]?.isCredit || walletsStore.items[id]?.withdrawal) && isCurrencyFiltered && !isArchived
        return wallet
      }

      const wallet = walletsStore.items[id][type] && isCurrencyFiltered && !isArchived
      return wallet
    })
  }

  // Remove empty groups
  return Object.fromEntries(Object.entries(grouped).filter(([_key, value]) => value.length > 0))
})

function getTotal(walletsIds: WalletId[]) {
  return walletsIds.reduce((acc, id) => {
    const wallet = walletsStore.sortedItems[id]
    if (!wallet)
      return acc

    return acc + +getAmountInBaseRate({ amount: wallet.amount, currencyCode: wallet.currency, noFormat: true })
  }, 0)
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

    <div class="grid max-w-3xl px-2 md:grid-cols-2 md:gap-12 md:px-6">
      <div class="md:order-1">
        <div
          v-if="walletsStore.currenciesUsed.length > 1"
          class="grid grid-cols-2 gap-2 pb-2 md:hidden"
        >
          <UiBox1 @click="isShowCurrencyFilter = true">
            <UiTitle6>{{ t("filterByCurrency") }}</UiTitle6>
            {{ currencyFiltered === "all" ? t("all") : currencyFiltered }}
          </UiBox1>

          <UiBox1 @click="currenciesStore.showBaseCurrenciesModal()">
            <UiTitle6>{{ t("currenciesBase") }}</UiTitle6>
            {{ currenciesStore.base }}
          </UiBox1>
        </div>

        <!-- Wallets Currencies -->
        <UiToggle
          v-if="walletsStore.currenciesUsed.length > 1"
          :initStatus="true"
          class="hidden md:grid md:max-w-xl"
          openPadding="pb-2"
          storageKey="finapp-wallets-currencies"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle8 :isShown @click="toggle">
              {{ t("filterByCurrency") }}
              {{ currencyFiltered === "all" ? "" : currencyFiltered }}
            </UiTitle8>
          </template>

          <template #default="{ toggle }">
            <UiTabs>
              <UiTabsItem
                :isActive="currencyFiltered === 'all'"
                @click="onSelectFilterCurrency('all', toggle)"
              >
                {{ t("all") }}
              </UiTabsItem>

              <UiTabsItem
                v-for="currency in walletsStore.currenciesUsed"
                :key="currency"
                :isActive="currencyFiltered === currency"
                @click="onSelectFilterCurrency(currency, toggle)"
              >
                {{ currency }}
              </UiTabsItem>
            </UiTabs>
          </template>
        </UiToggle>

        <WalletsTotal
          :activeType
          :currencyCode="currenciesStore.base"
          :walletsItems="selectedWallets2"
          class="pb-2"
          @click="setActiveType"
        />

        <UiBox1
          class="hidden md:grid"
          @click="currenciesStore.showBaseCurrenciesModal()"
        >
          <UiTitle6>{{ t("currenciesBase") }}</UiTitle6>
          {{ currenciesStore.base }}
        </UiBox1>
      </div>

      <div>
        <UiToggle2
          v-for="(walletsIds, type) in groupedWallets"
          :key="type"
          :storageKey="`finapp-wallets-show-${type}`"
          :initStatus="true"
          :lineWidth="1"
          openPadding="!pb-6"
        >
          <template #header="{ toggle, isShown }">
            <div
              class="flex items-center justify-between grow pr-3"
              @click="toggle"
            >
              <UiTitle88 :isShown>
                {{ $t(`money.totals.${type}`) }} {{ !isShown ? walletsIds.length : '' }}
              </UiTitle88>

              <Amount
                :amount="getTotal(walletsIds)"
                :currencyCode="currenciesStore.base"
              />
            </div>
          </template>

          <WalletsItem
            v-for="walletId in walletsIds"
            :key="walletId"
            :wallet="walletsStore.sortedItems[walletId]"
            :walletId
            :lineWidth="2"
            isShowBaseRate
            isShowIcons
            @click="$router.push(`/wallets/${walletId}`)"
            @filter="setWalletId(walletId)"
          />
        </UiToggle2>
      </div>

      <!-- <div class="md:max-w-md">
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
      </div> -->
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
