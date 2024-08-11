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

const isShowBaseCurrencyModal = ref(false)

const currencyFiltered = useStorage('finapp-wallets-active-currency', 'all')
const activeType = useStorage('finapp-wallets-active-type', 'all')
const gropedBy = useStorage<'list' | 'currencies' | 'type'>('finapp-wallets-groupedBy', 'list')

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

const groupedWalletsByCurrency = computed(() => {
  const grouped: Record<string, WalletId[]> = {}
  for (const currency of walletsStore.currenciesUsed) {
    grouped[currency] = walletsStore.sortedIds.filter((id) => {
      const isArchived = currency !== 'archived' && walletsStore.items[id].archived
      const isType = activeType.value === 'all' ? true : walletsStore.items[id][activeType.value]

      const wallet = walletsStore.items[id]?.currency === currency && !isArchived && isType
      return wallet
    })
  }

  return grouped
})

const groupedWalletsByType = computed(() => {
  const grouped: Record<string, WalletId[]> = {}
  for (const type of types) {
    grouped[type] = walletsStore.sortedIds.filter((id) => {
      let wallet = walletsStore.items?.[id]

      if (!wallet)
        return false

      const isCurrencyFiltered = currencyFiltered.value === 'all'
        ? true
        : wallet?.currency === currencyFiltered.value

      const isArchived = type !== 'archived' && wallet?.archived

      const isType = activeType.value === 'all'
        ? true
        : wallet[activeType.value]

      if (type === 'available') {
        wallet = (wallet?.isCredit || wallet?.withdrawal) && isCurrencyFiltered && !isArchived && isType
        return wallet
      }

      return wallet[type] && isCurrencyFiltered && !isArchived && isType
    })
  }

  // Remove empty groups
  return Object.fromEntries(Object.entries(grouped).filter(([_key, value]) => value.length > 0))
})

function countWalletsSum(walletsIds: WalletId[], isConvert = true) {
  return walletsIds.reduce((acc, id) => {
    const wallet = walletsStore.sortedItems[id]
    if (!wallet)
      return acc

    if (isConvert) {
      return acc + +getAmountInBaseRate({ amount: wallet.amount, currencyCode: wallet.currency, noFormat: true })
    }

    return acc + wallet.amount
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
        <UiToggle2
          v-if="walletsStore.currenciesUsed.length > 1"
          :initStatus="true"
          :lineWidth="1"
          class="hidden md:grid md:max-w-xl"
          openPadding="!pb-2"
          storageKey="finapp-wallets-currencies"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle88 :isShown @click="toggle">
              {{ t("filterByCurrency") }}
              {{ currencyFiltered === "all" ? "" : currencyFiltered }}
            </UiTitle88>
          </template>

          <template #default="{ toggle }">
            <UiTabs2 class="flex gap-1 px-2">
              <DateLinkItem
                :isActive="currencyFiltered === 'all'"
                @click="onSelectFilterCurrency('all', toggle)"
              >
                {{ t("all") }}
              </DateLinkItem>

              <DateLinkItem
                v-for="currency in walletsStore.currenciesUsed"
                :key="currency"
                :isActive="currencyFiltered === currency"
                @click="onSelectFilterCurrency(currency, toggle)"
              >
                {{ currency }}
              </DateLinkItem>
            </UiTabs2>
          </template>
        </UiToggle2>

        <UiBox1
          class="hidden md:grid"
          @click="currenciesStore.showBaseCurrenciesModal()"
        >
          <UiTitle6>{{ t("currenciesBase") }}</UiTitle6>
          {{ currenciesStore.base }}
        </UiBox1>
      </div>

      <div>
        <UiTabs class="mb-2">
          <UiTabsItem
            :isActive="gropedBy === 'list'"
            @click="gropedBy = 'list'"
          >
            list
          </UiTabsItem>
          <UiTabsItem
            :isActive="gropedBy === 'type'"
            @click="gropedBy = 'type'"
          >
            type
          </UiTabsItem>
          <UiTabsItem
            :isActive="gropedBy === 'currencies'"
            @click="gropedBy = 'currencies'"
          >
            currencies
          </UiTabsItem>
        </UiTabs>

        <!-- <UiToggle2
          storageKey="finapp-wallets-show-gropedBy"
          :initStatus="true"
          :lineWidth="1"
          openPadding="!pb-2"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle88 :isShown @click="toggle">
              Grouped By
            </UiTitle88>
          </template>

          <UiTabs>
            <UiTabsItem
              :isActive="gropedBy === 'list'"
              @click="gropedBy = 'list'"
            >
              list
            </UiTabsItem>
            <UiTabsItem
              :isActive="gropedBy === 'type'"
              @click="gropedBy = 'type'"
            >
              type
            </UiTabsItem>
            <UiTabsItem
              :isActive="gropedBy === 'currencies'"
              @click="gropedBy = 'currencies'"
            >
              currencies
            </UiTabsItem>
          </UiTabs>
        </UiToggle2> -->

        <UiToggle2
          :initStatus="true"
          :lineWidth="1"
          :storageKey="`finapp-wallets-total-${gropedBy}`"
          openPadding="!pb-6"
        >
          <!-- Header -->
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between grow">
              <UiTitle88 :isShown @click="toggle">
                {{ t('statistics.title') }}
              </UiTitle88>
            </div>
          </template>

          <WalletsTotal
            :activeType
            :gropedBy
            :currencyCode="currenciesStore.base"
            :walletsItems="selectedWallets2"
            @click="setActiveType"
          />
        </UiToggle2>

        <template v-if="gropedBy === 'currencies'">
          <UiToggle2
            v-for="(walletsIds, currency) in groupedWalletsByCurrency"
            :key="currency"
            :storageKey="`finapp-wallets-show-${currency}`"
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
                  {{ currency }} {{ !isShown ? walletsIds.length : '' }}
                </UiTitle88>

                <Amount
                  :amount="countWalletsSum(walletsIds, false)"
                  :currencyCode="currency"
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
        </template>

        <template v-if="gropedBy === 'type'">
          <UiToggle2
            v-for="(walletsIds, type) in groupedWalletsByType"
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
                  :amount="countWalletsSum(walletsIds)"
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
        </template>

        <div
          v-if="gropedBy === 'list'"
          class="md:max-w-md"
        >
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
    </div>
  </UiPage>

  <!-- Sort -->
  <WalletsSortModal v-if="isModalOpen('walletsSort')" />

  <div v-if="walletsStore.currenciesUsed.length > 1">
    <CurrenciesModal
      v-if="isShowBaseCurrencyModal"
      :activeCode="currenciesStore.base"
      @onSelect="currenciesStore.setBase"
      @onClose="isShowBaseCurrencyModal = false"
    />

    <CurrenciesModal
      v-if="isShowCurrencyFilter"
      :activeCode="currencyFiltered"
      isShowAll
      @onSelect="onSelectFilterCurrency"
      @onClose="isShowCurrencyFilter = false"
    />
  </div>
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
