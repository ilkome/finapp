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
  ogTitle: t('wallets.name'),
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
const groupedBy = useStorage<'list' | 'currencies' | 'type'>(
  'finapp-wallets-groupedBy',
  'list',
)

function setActiveType(v: WalletViewTypes | 'all') {
  activeType.value = v
}

const groupedOptions = useStorage('finapp-wallets-groupedOptions', {
  currencies: 0,
  type: 0,
})

const selectedWallets = computed(() => {
  return Object.fromEntries(
    Object.entries(walletsStore.itemsWithAmount).filter(([_key, wallet]) => {
      const isCurrencyMatch = currencyFiltered.value === 'all' || currencyFiltered.value === wallet.currency
      if (!isCurrencyMatch)
        return false

      if (activeType.value === 'all')
        return !wallet.isArchived

      const typeChecks: WalletViewTypesObj = {
        archived: wallet.isArchived ?? false,
        available: (checkIsAvailable(wallet) && !wallet.isArchived) ?? false,
        cash: wallet.type === 'cash' && !wallet.isArchived,
        cashless: wallet.type === 'cashless' && !wallet.isArchived,
        credit: wallet.type === 'credit',
        creditPossible: !!wallet.creditLimit,
        crypto: wallet.type === 'crypto' && !wallet.isArchived,
        debt: wallet.type === 'debt' && !wallet.isArchived,
        deposit: wallet.type === 'deposit' && !wallet.isArchived,
        withdrawal: (wallet.isWithdrawal ?? false) && !wallet.isArchived,
      }

      if (activeType.value === 'available')
        return checkIsAvailable(wallet) && !wallet.isArchived

      if (activeType.value === 'archived' && wallet.isArchived)
        return true

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

  for (const walletId in walletsStore.itemsWithAmount) {
    const wallet = walletsStore.itemsWithAmount[walletId]
    if (!wallet)
      continue

    const itemValue
      = wallet.currency === currenciesStore.base
        ? (walletsStore.itemsWithAmount[walletId]?.amount ?? 0)
        : +getAmountInBaseRate({
            amount: walletsStore.itemsWithAmount[walletId]?.amount ?? 0,
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
    const wallet = walletsStore.itemsWithAmount[id]
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
    isShow: Object.keys(walletsStore.items ?? {}).length > 1 && groupedBy.value === 'list' && totalInWallets.value.cash !== 0,
    value: totalInWallets.value.cash,
  },
  cashless: {
    id: 'cashless',
    isShow: groupedBy.value === 'list' && totalInWallets.value.cashless !== 0,
    value: totalInWallets.value.cashless,
  },
  credit: {
    id: 'credit',
    isShow: groupedBy.value === 'list' && totalInWallets.value.credit !== 0,
    value: totalInWallets.value.credit,
  },
  creditPossible: {
    id: 'creditPossible',
    isShow: totalInWallets.value.creditPossible !== 0,
    value: totalInWallets.value.creditPossible + totalInWallets.value.credit,
  },
  debt: {
    id: 'debt',
    isShow: groupedBy.value === 'list' && totalInWallets.value.debt !== 0,
    value: totalInWallets.value.debt,
  },
  deposit: {
    icon: 'deposit',
    id: 'deposit',
    isShow: groupedBy.value === 'list' && totalInWallets.value.deposit !== 0,
    value: totalInWallets.value.deposit,
  },
  withdrawal: {
    icon: 'UiIconWalletWithdrawal',
    id: 'withdrawal',
    isShow: groupedBy.value === 'list' && totalInWallets.value.withdrawal !== 0,
    value: totalInWallets.value.withdrawal,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  archived: {
    id: 'archived',
    isShow: Object.values(walletsStore.items ?? {}).some(wallet => wallet.isArchived),
    value: totalInWallets.value.archived + totalInWallets.value.archived,
  },
}))
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('wallets.name') }}</UiHeaderTitle>
      <template #actions>
        <UiItem3
          v-if="walletsStore.sortedIds.length > 1"
          @click="openModal('walletsSort')"
        >
          <Icon name="lucide:arrow-down-up" size="20" />
        </UiItem3>
        <UiItem3 @click="router.push('/wallets/new')">
          <Icon name="lucide:plus" size="24" />
        </UiItem3>
      </template>
    </UiHeader>

    <!-- Empty -->
    <div
      v-if="!walletsStore.hasItems"
      class="pageWrapper"
    >
      <div class="md:max-w-xs">
        <UiButtonBlue
          @click="router.push('/wallets/new')"
        >
          {{ t("wallets.new") }}
        </UiButtonBlue>
      </div>
    </div>

    <!-- Content -->
    <div
      v-else
      class="pageWrapperNoMaxWidth"
    >
      <div class="grid max-w-3xl md:grid-cols-2 md:gap-12">
        <div class="grid content-start pt-2 md:order-1 md:gap-4 md:pt-1">
          <div
            v-if="walletsStore.currenciesUsed.length > 1"
            class="grid grid-cols-2 gap-2 pb-2 md:hidden"
          >
            <!-- Currencies -->
            <UiBox3 @click="isShowCurrencyFilter = true">
              <UiTitle6>{{ t('filterByCurrency') }}</UiTitle6>
              {{ currencyFiltered === 'all' ? t('all') : currencyFiltered }}
            </UiBox3>

            <!-- Base -->
            <UiBox3 @click="isShowBaseCurrencyModal = true">
              <UiTitle6>{{ t('currencies.base') }}</UiTitle6>
              {{ currenciesStore.base }}
            </UiBox3>
          </div>

          <!-- Wallets Currencies -->
          <UiToggle2
            v-if="walletsStore.currenciesUsed.length > 1 && groupedBy !== 'currencies'"
            :initStatus="true"
            :lineWidth="0"
            class="hidden md:grid md:max-w-xl"
            openPadding="!pb-2"
            storageKey="finapp-wallets-currencies"
          >
            <template #header="{ toggle, isShown }">
              <UiTitle8
                :isShown
                @click="toggle"
              >
                {{ t('filterByCurrency') }}
                {{ (currencyFiltered !== 'all' && !isShown) ? currencyFiltered : '' }}
              </UiTitle8>
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

          <!-- Total -->
          <UiToggle2
            v-if="groupedBy === 'list'"
            :initStatus="true"
            :lineWidth="0"
            :storageKey="`finapp-wallets-total-${groupedBy}`"
            class="hidden pb-3 md:grid"
            openPadding="!pb-4"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex grow items-center justify-between">
                <UiTitle8 :isShown @click="toggle">
                  {{ t('statistics.title') }}
                </UiTitle8>
              </div>
            </template>

            <WalletsTotal
              :activeType="groupedBy === 'list' ? activeType : false"
              :currencyCode="currenciesStore.base"
              :items="Object.values(counts).filter((item) => item.isShow)"
              @click="setActiveType"
            />
          </UiToggle2>

          <UiBox3
            class="hidden md:grid"
            @click="isShowBaseCurrencyModal = true"
          >
            <UiTitle6>{{ t('currencies.base') }}</UiTitle6>
            {{ currenciesStore.base }}
          </UiBox3>
        </div>

        <div>
          <div class="mb-2 flex items-center gap-2 md:pt-2">
            <UiTabs1>
              <UiTabsItem1
                :isActive="groupedBy === 'list'"
                @click="groupedBy = 'list'"
              >
                {{ t('list') }}
              </UiTabsItem1>
              <UiTabsItem1
                :isActive="groupedBy === 'type'"
                @click="groupedBy = 'type'"
              >
                {{ t('type') }}
              </UiTabsItem1>

              <UiTabsItem1
                v-if="walletsStore.currenciesUsed.length > 1"
                :isActive="groupedBy === 'currencies'"
                @click="groupedBy = 'currencies'"
              >
                {{ t('currencies') }}
              </UiTabsItem1>
            </UiTabs1>
            <UiItem1
              v-if="groupedBy !== 'list'"
              class="grow-0 px-5"
              @click="groupedOptions[groupedBy] = groupedOptions[groupedBy] === 0 ? 1 : 0"
            >
              <Icon
                :name="groupedOptions[groupedBy] === 0 ? 'lucide:folder-tree' : 'lucide:network'"
                size="18"
              />
            </UiItem1>
          </div>

          <!-- Statistics -->
          <UiToggle2
            v-if="groupedBy === 'list'"
            :initStatus="true"
            :lineWidth="0"
            :storageKey="`finapp-wallets-total-${groupedBy}`"
            class="pb-3 md:hidden"
            openPadding="!pb-4"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex grow items-center justify-between">
                <UiTitle8 :isShown @click="toggle">
                  {{ t('statistics.title') }}
                </UiTitle8>
              </div>
            </template>

            <WalletsTotal
              :activeType="groupedBy === 'list' ? activeType : false"
              :currencyCode="currenciesStore.base"
              :items="Object.values(counts).filter((item) => item.isShow)"
              @click="setActiveType"
            />
          </UiToggle2>

          <!-- List -->
          <div
            v-if="groupedBy === 'list'"
            class="md:max-w-lg"
          >
            <WalletsItem
              v-for="(walletItem, walletId) in selectedWallets"
              :key="walletId"
              :wallet="walletItem"
              :walletId
              :lineWidth="2"
              class="group"
              isShowBaseRate
              isShowIcon
              isShowRate
              @click="router.push(`/wallets/${walletId}`)"
            />
          </div>

          <!-- By currencies -->
          <template v-if="groupedBy === 'currencies'">
            <UiToggle2
              v-for="(walletsIds, currency) in groupedWalletsByCurrency"
              :key="currency"
              :storageKey="`finapp-wallets-show-${currency}`"
              :initStatus="true"
              :lineWidth="1"
              openPadding="!pb-3"
            >
              <template #header="{ toggle, isShown }">
                <div
                  class="flex grow items-center justify-between pr-3"
                  @click="toggle"
                >
                  <UiTitle81 :isShown>
                    {{ currency }} {{ !isShown ? walletsIds.length : '' }}
                  </UiTitle81>

                  <div class="py-2">
                    <Amount
                      :amount="countWalletsSum(walletsIds, false, true)"
                      :currencyCode="currency"
                    />
                  </div>
                </div>
              </template>

              <div class="border-item-5 ml-5 -translate-x-px border-l pl-3">
                <template v-if="groupedOptions.currencies === 0">
                  <WalletsItem
                    v-for="walletId in walletsIds"
                    :key="walletId"
                    :wallet="walletsStore.itemsWithAmount[walletId]"
                    :walletId
                    :lineWidth="2"
                    isShowBaseRate
                    isShowIcon
                    class="group"
                    @click="router.push(`/wallets/${walletId}`)"
                  />
                </template>

                <template v-if="groupedOptions.currencies === 1">
                  <UiToggle2
                    v-for="(groupedWalletsIds, grouped) in groupBy(walletsIds, groupByWalletType)"
                    :key="grouped"
                    :initStatus="true"
                    :lineWidth="1"
                    :storageKey="`finapp-wallets-show-${currency}-${grouped}`"
                    openPadding="!pb-3"
                  >
                    <template #header="{ isShown, toggle }">
                      <div
                        class="flex grow items-center justify-between pr-3"
                        @click="toggle"
                      >
                        <UiTitle81 :isShown>
                          {{ t(`money.types.${grouped}`) }}
                        </UiTitle81>
                        <div class="py-2">
                          <Amount
                            :amount="countWalletsSum(groupedWalletsIds, false)"
                            :currencyCode="currency"
                          />
                        </div>
                      </div>
                    </template>

                    <div class="border-item-5 ml-5 -translate-x-px border-l pl-3">
                      <WalletsItem
                        v-for="walletId in groupedWalletsIds"
                        :key="walletId"
                        isShowIcon
                        isShowBaseRate
                        class="group"
                        :walletId
                        :wallet="walletsStore.itemsWithAmount[walletId]"
                        :lineWidth="2"
                        @click="router.push(`/wallets/${walletId}`)"
                      />
                    </div>
                  </UiToggle2>
                </template>
              </div>
            </UiToggle2>
          </template>

          <!-- By Type -->
          <template v-if="groupedBy === 'type'">
            <UiToggle2
              v-for="(walletsIds, type) in groupedWalletsByTypeOnly"
              :key="type"
              :storageKey="`finapp-wallets-show-${type}`"
              :initStatus="true"
              :lineWidth="1"
              openPadding="!pb-3"
            >
              <template #header="{ toggle, isShown }">
                <div
                  class="flex grow items-center justify-between pr-3"
                  @click="toggle"
                >
                  <UiTitle81 :isShown>
                    {{ t(`money.types.${type}`) }} {{ walletsIds.length }}
                  </UiTitle81>

                  <div class="py-2">
                    <Amount
                      :amount="countWalletsSum(walletsIds)"
                      :currencyCode="currenciesStore.base"
                    />
                  </div>
                </div>
              </template>

              <div class="border-item-5 ml-5 -translate-x-px border-l pl-3">
                <template v-if="groupedOptions.type === 0">
                  <WalletsItem
                    v-for="walletId in walletsIds"
                    :key="walletId"
                    :wallet="walletsStore.itemsWithAmount[walletId]"
                    :walletId
                    :lineWidth="2"
                    isShowBaseRate
                    isShowIcon
                    class="group"
                    @click="router.push(`/wallets/${walletId}`)"
                  />
                </template>

                <template v-if="groupedOptions.type === 1">
                  <UiToggle2
                    v-for="(groupedWalletsIds, currency) in groupBy(walletsIds, groupByWalletCurrency)"
                    :key="currency"
                    :storageKey="`finapp-wallets-show-${type}-${currency}`"
                    :initStatus="true"
                    :lineWidth="1"
                    openPadding="!pb-3"
                  >
                    <template #header="{ toggle, isShown }">
                      <div
                        class="flex grow items-center justify-between pr-3"
                        @click="toggle"
                      >
                        <UiTitle81 :isShown>
                          {{ currency }}
                        </UiTitle81>

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

                    <div class="border-item-5 ml-5 -translate-x-px border-l pl-3">
                      <WalletsItem
                        v-for="walletId in groupedWalletsIds"
                        :key="walletId"
                        :wallet="walletsStore.itemsWithAmount[walletId]"
                        :walletId
                        :lineWidth="2"
                        isShowBaseRate
                        isShowIcon
                        class="group"
                        @click="router.push(`/wallets/${walletId}`)"
                      />
                    </div>
                  </UiToggle2>
                </template>
              </div>
            </UiToggle2>
          </template>
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
    isShowAllButton
    isHideUnused
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
