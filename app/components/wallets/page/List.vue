<script setup lang="ts">
import { groupBy } from 'es-toolkit'
import { useStorage } from '@vueuse/core'
import type { CurrencyCode } from '~/components/currencies/types'
import type {
  WalletId,
  WalletItem,
  WalletViewTypes,
  WalletViewTypesObj,
} from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { viewTypes } from '~/components/wallets/types'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const router = useRouter()

useSeoMeta({
  title: t('wallets.name'),
})

const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const { isModalOpen, openModal } = useAppNav()
const { getAmountInBaseRate } = useAmount()

const isShowBaseCurrencyModal = ref(false)

const currencyFiltered = useStorage('finapp-wallets-active-currency', 'all')
const activeType = useStorage<WalletViewTypes | 'all'>(
  'finapp-wallets-active-type',
  'all',
)
const gropedBy = useStorage<'list' | 'currencies' | 'type'>(
  'finapp-wallets-groupedBy',
  'list',
)

function setActiveType(v: WalletViewTypes | 'all') {
  activeType.value = v
}

const selectedWallets = computed(() => {
  if (currencyFiltered.value === 'all' && activeType.value === 'all')
    return walletsStore.sortedItems

  return Object.fromEntries(
    Object.entries(walletsStore.sortedItems).filter(([_key, wallet]) => {
      const isCurrencyMatch = currencyFiltered.value === 'all' || currencyFiltered.value === wallet.currency
      if (!isCurrencyMatch)
        return false

      if (activeType.value === 'all')
        return true

      const typeChecks: WalletViewTypesObj = {
        archived: wallet.isArchived ?? false,
        available: (checkIsAvailable(wallet) && !wallet.isArchived) ?? false,
        cash: wallet.type === 'cash',
        cashless: wallet.type === 'cashless',
        credit: wallet.type === 'credit',
        creditPossible: !!wallet.creditLimit,
        crypto: wallet.type === 'crypto',
        debt: wallet.type === 'debt',
        deposit: wallet.type === 'deposit',
        withdrawal: wallet.isWithdrawal ?? false,
      }

      if (activeType.value === 'available')
        return checkIsAvailable(wallet) && !wallet.isArchived

      return typeChecks[activeType.value]
    }),
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

const groupedWalletsByCurrency = computed(() => {
  const grouped: Record<string, WalletId[]> = Object.fromEntries(
    walletsStore.currenciesUsed.map(currency => [currency, []]),
  )

  return walletsStore.sortedIds.reduce((grouped, id) => {
    const wallet = walletsStore.items?.[id]
    if (wallet?.currency && !wallet.isArchived)
      grouped[wallet.currency]?.push(id)
    return grouped
  }, grouped)
})

const groupedWalletsByType = computed(() =>
  viewTypes.reduce(
    (acc, type) => {
      acc[type] = walletsStore.sortedIds.filter((id) => {
        const wallet = walletsStore.items?.[id]

        if (!wallet)
          return false

        const isCurrencyFiltered
          = currencyFiltered.value === 'all'
            ? true
            : wallet?.currency === currencyFiltered.value

        if (type === 'available') {
          return checkIsAvailable(wallet) && isCurrencyFiltered && !wallet?.isArchived
        }

        if (type === 'archived') {
          return isCurrencyFiltered && wallet?.isArchived
        }

        return wallet.type === type && isCurrencyFiltered && !wallet?.isArchived
      })

      return acc
    },
    {} as Record<CurrencyCode, WalletId[]>,
  ),
)

const groupedWalletsByTypeOnly = computed(() => {
  return Object.fromEntries(Object.entries(groupedWalletsByType.value).filter(([_, walletsIds]) => walletsIds.length > 0))
})

const totalInWallets = computed(() => {
  const sum = {
    archived: 0,
    cash: 0,
    cashless: 0,
    credit: 0,
    creditPossible: 0,
    debt: 0,
    deposit: 0,
    total: 0,
    withdrawal: 0,
  }

  for (const walletId in walletsStore.sortedItems) {
    const wallet = walletsStore.sortedItems[walletId]
    if (!wallet)
      continue

    const itemValue
      = wallet.currency === currenciesStore.base
        ? (walletsStore.totals[walletId] ?? 0)
        : +getAmountInBaseRate({
            amount: walletsStore.totals[walletId] ?? 0,
            currencyCode: wallet.currency ?? 'USD',
            noFormat: true,
          })

    if (currencyFiltered.value !== 'all' && wallet.currency !== currencyFiltered.value) {
      continue
    }

    if (!wallet.isExcludeInTotal) {
      sum.total += itemValue
    }

    if (wallet.type === 'cash')
      sum.cash += itemValue

    if (wallet.type === 'cashless')
      sum.cashless += itemValue

    if (wallet.type === 'deposit')
      sum.deposit += itemValue

    if (wallet.type === 'debt')
      sum.debt += itemValue

    if (wallet.type === 'credit')
      sum.credit += itemValue

    if (wallet.creditLimit) {
      sum.creditPossible
        = sum.creditPossible
        + +getAmountInBaseRate({
          amount: wallet.creditLimit ?? 0,
          currencyCode: wallet.currency ?? 'USD',
          noFormat: true,
        })
    }

    if (wallet.isWithdrawal)
      sum.withdrawal += itemValue

    if (wallet.isArchived)
      sum.archived += itemValue
  }

  return sum
})

function groupByWalletType(id: WalletId) {
  return walletsStore.items?.[id]?.type
}

function groupByWalletCurrency(id: WalletId) {
  const wallet = walletsStore.items?.[id]
  return wallet?.currency
}

function countWalletsSum(
  walletsIds: WalletId[],
  isConvert = true,
  isExcludeInTotal = false,
) {
  return walletsIds.reduce((acc, id) => {
    const wallet = walletsStore.sortedItems[id]
    if (!wallet)
      return acc

    if (isConvert) {
      return (
        acc
        + +getAmountInBaseRate({
          amount: wallet.amount,
          currencyCode: wallet.currency,
          noFormat: true,
        })
      )
    }

    if (isExcludeInTotal && wallet.isExcludeInTotal)
      return acc
    return acc + wallet.amount
  }, 0)
}

function checkIsAvailable(wallet: WalletItem) {
  return wallet.type === 'credit' || wallet.isWithdrawal
}

const counts = computed(() => ({
  all: {
    id: 'all',
    isShow: true,
    value: totalInWallets.value.total - totalInWallets.value.credit - totalInWallets.value.debt,
  },
  cash: {
    id: 'cash',
    isShow: gropedBy.value === 'list' && totalInWallets.value.cash !== 0,
    value: totalInWallets.value.cash,
  },
  cashless: {
    id: 'cashless',
    isShow: gropedBy.value === 'list' && totalInWallets.value.cashless !== 0,
    value: totalInWallets.value.cashless,
  },
  credit: {
    id: 'credit',
    isShow: gropedBy.value === 'list' && totalInWallets.value.credit !== 0,
    value: totalInWallets.value.credit,
  },
  creditPossible: {
    id: 'creditPossible',
    isShow: totalInWallets.value.creditPossible !== 0,
    value: totalInWallets.value.creditPossible + totalInWallets.value.credit,
  },
  debt: {
    id: 'debt',
    isShow: gropedBy.value === 'list' && totalInWallets.value.debt !== 0,
    value: totalInWallets.value.debt,
  },
  deposit: {
    icon: 'deposit',
    id: 'deposit',
    isShow: gropedBy.value === 'list' && totalInWallets.value.deposit !== 0,
    value: totalInWallets.value.deposit,
  },
  withdrawal: {
    icon: 'UiIconWalletWithdrawal',
    id: 'withdrawal',
    isShow: gropedBy.value === 'list' && totalInWallets.value.withdrawal !== 0,
    value: totalInWallets.value.withdrawal,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  archived: {
    id: 'archived',
    isShow: totalInWallets.value.archived !== 0,
    value: totalInWallets.value.archived + totalInWallets.value.archived,
  },
}))
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('wallets.name') }}</UiHeaderTitle>
      <template #actions>
        <UiHeaderLink
          v-if="walletsStore.sortedIds.length > 1"
          @click="openModal('walletsSort')"
        >
          <UiIconOrder class="size-5" />
        </UiHeaderLink>
        <UiHeaderLink @click="router.push('/wallets/new')">
          <UiIconAdd class="size-5" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div
      v-if="!walletsStore.hasItems"
      class="pageWrapper"
    >
      <div class="max-w-xs">
        <UiButtonBlue
          @click="router.push('/wallets/new')"
        >
          {{ t("wallets.new") }}
        </UiButtonBlue>
      </div>
    </div>

    <div
      v-else
      class="pageWrapperNoMaxWidth"
    >
      <div class="grid max-w-3xl md:grid-cols-2 md:gap-12">
        <div class="md:order-1">
          <div
            v-if="walletsStore.currenciesUsed.length > 1"
            class="grid grid-cols-2 gap-2 pb-2 md:hidden"
          >
            <UiBox1 @click="isShowCurrencyFilter = true">
              <UiTitle6>{{ t('filterByCurrency') }}</UiTitle6>
              {{ currencyFiltered === 'all' ? t('all') : currencyFiltered }}
            </UiBox1>

            <UiBox1 @click="isShowBaseCurrencyModal = true">
              <UiTitle6>{{ t('currencies.base') }}</UiTitle6>
              {{ currenciesStore.base }}
            </UiBox1>
          </div>

          <!-- Wallets Currencies -->
          <UiToggle2
            v-if="walletsStore.currenciesUsed.length > 1 && gropedBy !== 'currencies'"
            :initStatus="true"
            :lineWidth="1"
            class="hidden md:grid md:max-w-xl"
            openPadding="!pb-2"
            storageKey="finapp-wallets-currencies"
          >
            <template #header="{ toggle, isShown }">
              <UiTitle88
                :isShown
                @click="toggle"
              >
                {{ t('filterByCurrency') }}
                {{ currencyFiltered === 'all' ? '' : currencyFiltered }}
              </UiTitle88>
            </template>

            <template #default="{ toggle }">
              <UiTabs2 class="flex gap-1 px-2 md:px-0">
                <DateLinkItem
                  :isActive="currencyFiltered === 'all'"
                  @click="onSelectFilterCurrency('all', toggle)"
                >
                  {{ t('common.all') }}
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
            @click="isShowBaseCurrencyModal = true"
          >
            <UiTitle6>{{ t('currenciesBase') }}</UiTitle6>
            {{ currenciesStore.base }}
          </UiBox1>
        </div>

        <div>
          <UiTabs class="mb-2">
            <UiTabsItem
              :isActive="gropedBy === 'list'"
              @click="gropedBy = 'list'"
            >
              {{ t('list') }}
            </UiTabsItem>
            <UiTabsItem
              :isActive="gropedBy === 'type'"
              @click="gropedBy = 'type'"
            >
              {{ t('type') }}
            </UiTabsItem>

            <UiTabsItem
              v-if="walletsStore.currenciesUsed.length > 1"
              :isActive="gropedBy === 'currencies'"
              @click="gropedBy = 'currencies'"
            >
              {{ t('currencies') }}
            </UiTabsItem>
          </UiTabs>

          <!-- Statistics -->
          <UiToggle2
            v-if="gropedBy === 'list'"
            :initStatus="true"
            :lineWidth="0"
            :storageKey="`finapp-wallets-total-${gropedBy}`"
            class="!pb-6"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex grow items-center justify-between">
                <UiTitle88 :isShown @click="toggle">
                  {{ t('statistics.title') }}
                </UiTitle88>
              </div>
            </template>

            <WalletsTotal
              :activeType="gropedBy === 'list' ? activeType : false"
              :currencyCode="currenciesStore.base"
              :items="Object.values(counts).filter((item) => item.isShow)"
              @click="setActiveType"
            />
          </UiToggle2>

          <!-- By currencies -->
          <template v-if="gropedBy === 'currencies' && walletsStore.currenciesUsed.length > 1">
            <UiToggle2
              v-for="(walletsIds, currency) in groupedWalletsByCurrency"
              :key="currency"
              :storageKey="`finapp-wallets-show-${currency}`"
              :initStatus="true"
              :lineWidth="1"
              openPadding="!pb-2"
            >
              <template #header="{ toggle, isShown }">
                <div
                  class="flex grow items-center justify-between pr-3"
                  @click="toggle"
                >
                  <UiTitle88 :isShown>
                    {{ currency }} {{ !isShown ? walletsIds.length : '' }}
                  </UiTitle88>

                  <div class="py-2">
                    <Amount
                      :amount="countWalletsSum(walletsIds, false, true)"
                      :currencyCode="currency"
                    />
                  </div>
                </div>
              </template>

              <UiToggle2
                v-for="(groupedWalletsIds, grouped) in groupBy(walletsIds, groupByWalletType)"
                :key="grouped"
                class="border-item-5 ml-3 border-l pl-2"
                :storageKey="`finapp-wallets-show-${currency}-${grouped}`"
                :initStatus="true"
                :lineWidth="1"
                openPadding="!pb-3"
              >
                <template #header="{ toggle }">
                  <div
                    class="flex grow items-center justify-between pr-3"
                    @click="toggle"
                  >
                    <UiTitle8>{{ t(`money.types.${grouped}`) }}</UiTitle8>
                    <div class="py-2">
                      <Amount
                        :amount="countWalletsSum(groupedWalletsIds, false)"
                        :currencyCode="currency"
                      />
                    </div>
                  </div>
                </template>

                <WalletsItem
                  v-for="walletId in groupedWalletsIds"
                  :key="walletId"
                  :wallet="walletsStore.sortedItems[walletId]"
                  :walletId
                  :lineWidth="2"
                  isShowBaseRate
                  isShowIcons
                  @click="router.push(`/wallets/${walletId}`)"
                />
              </UiToggle2>
            </UiToggle2>
          </template>

          <!-- By Type -->
          <template v-if="gropedBy === 'type' && Object.keys(groupedWalletsByTypeOnly).length > 0">
            <UiToggle2
              v-for="(walletsIds, type) in groupedWalletsByTypeOnly"
              :key="type"
              :storageKey="`finapp-wallets-show-${type}`"
              :initStatus="true"
              :lineWidth="1"
              openPadding="!pb-6"
            >
              <template #header="{ toggle, isShown }">
                <div
                  class="flex grow items-center justify-between pr-3"
                  @click="toggle"
                >
                  <UiTitle88 :isShown>
                    {{ t(`money.types.${type}`) }} {{ walletsIds.length }}
                  </UiTitle88>

                  <div class="py-2">
                    <Amount
                      :amount="countWalletsSum(walletsIds)"
                      :currencyCode="currenciesStore.base"
                    />
                  </div>
                </div>
              </template>

              <template v-if="Object.keys(groupBy(walletsIds, groupByWalletCurrency)).length > 1">
                <UiToggle2
                  v-for="(groupedWalletsIds, currency) in groupBy(walletsIds, groupByWalletCurrency)"
                  :key="currency"
                  class="border-item-5 ml-3 border-l pl-2"
                  :storageKey="`finapp-wallets-show-${type}-${currency}`"
                  :initStatus="true"
                  :lineWidth="1"
                  openPadding="!pb-6"
                >
                  <template #header="{ toggle }">
                    <div
                      class="flex grow items-center justify-between pr-3"
                      @click="toggle"
                    >
                      <UiTitle8>{{ currency }}</UiTitle8>
                      <div class="py-2">
                        <Amount
                          :amount="countWalletsSum(groupedWalletsIds)"
                          :currencyCode="currenciesStore.base"
                          :isShowBaseRate="false"
                        />
                        <Amount
                          v-if="currenciesStore.base !== currency"
                          :amount="countWalletsSum(groupedWalletsIds, false)"
                          :currencyCode="currency"
                          :isShowBaseRate="false"
                          variant="2xs"
                        />
                      </div>
                    </div>
                  </template>

                  <WalletsItem
                    v-for="walletId in groupedWalletsIds"
                    :key="walletId"
                    :wallet="walletsStore.sortedItems[walletId]"
                    :walletId
                    :lineWidth="2"
                    isShowBaseRate
                    isShowIcons
                    @click="router.push(`/wallets/${walletId}`)"
                  />
                </UiToggle2>
              </template>

              <template v-else>
                <div
                  v-for="(groupedWalletsIds, currency) in groupBy(walletsIds, groupByWalletCurrency)"
                  :key="currency"
                >
                  <WalletsItem
                    v-for="walletId in groupedWalletsIds"
                    :key="walletId"
                    :wallet="walletsStore.sortedItems[walletId]"
                    :walletId
                    :lineWidth="2"
                    isShowBaseRate
                    isShowIcons
                    @click="router.push(`/wallets/${walletId}`)"
                  />
                </div>
              </template>
            </UiToggle2>
          </template>

          <!-- List -->
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
              @click="router.push(`/wallets/${walletId}`)"
            />
          </div>
        </div>
      </div>
    </div>
  </UiPage>

  <!-- Sort -->
  <WalletsSortModal v-if="isModalOpen('walletsSort')" />

  <CurrenciesModal
    v-if="isShowBaseCurrencyModal"
    :activeCode="currenciesStore.base"
    @onSelect="currenciesStore.setBase"
    @onClose="isShowBaseCurrencyModal = false"
  />

  <CurrenciesModal
    v-if="walletsStore.currenciesUsed.length > 1 && isShowCurrencyFilter"
    :activeCode="currencyFiltered"
    isShowAll
    @onSelect="onSelectFilterCurrency"
    @onClose="isShowCurrencyFilter = false"
  />
</template>

<i18n lang="yaml">
en:
  currencies: Currencies
  filterByCurrency: Filter by
  list: List
  type: Type

ru:
  currencies: Валюты
  filterByCurrency: Валюты кошельков
  list: Список
  type: Тип
</i18n>
