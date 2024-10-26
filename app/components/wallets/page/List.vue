<script setup lang="ts">
import { groupBy } from 'es-toolkit'
import { useStorage } from '@vueuse/core'
import type { CurrencyCode } from '~/components/currencies/types'
import type {
  WalletId,
  WalletItem,
  WalletTypeViewAll,
  WalletTypes,
  WalletTypesView,
} from '~/components/wallets/types'
import useAmount from '~/components/amount/useAmount'
import { types } from '~/components/wallets/types'
import { useAppNav } from '~/components/app/useAppNav'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
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
const activeType = useStorage<WalletTypeViewAll>(
  'finapp-wallets-active-type',
  'all',
)
const gropedBy = useStorage<'list' | 'currencies' | 'type'>(
  'finapp-wallets-groupedBy',
  'list',
)

function setActiveType(v: WalletTypeViewAll) {
  activeType.value = v
}

const selectedWallets = computed(() => {
  if (currencyFiltered.value === 'all' && activeType.value === 'all')
    return walletsStore.sortedItems

  return Object.fromEntries(
    Object.entries(walletsStore.sortedItems).filter(([_key, wallet]) => {
      const isCurrencyMatch
        = currencyFiltered.value === 'all'
        || currencyFiltered.value === wallet.currency
      if (!isCurrencyMatch)
        return false

      if (activeType.value === 'all')
        return true

      const typeChecks: WalletTypesView = {
        creditPossible: !!wallet.creditLimit,
        isCash: wallet.isCash,
        isCashless: wallet.isCashless,
        isCredit: wallet.isCredit,
        isDebt: wallet.isDebt,
        isDeposit: wallet.isDeposit,
        showWithCredit: !wallet.isCredit,
        withdrawal: wallet.withdrawal,
      }

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

const groupedWalletsByCurrency = computed(() =>
  walletsStore.currenciesUsed.reduce(
    (acc, currency) => {
      acc[currency] = walletsStore.sortedIds.filter((id) => {
        const wallet = walletsStore.items?.[id]
        if (!wallet)
          return false

        const isArchived = currency !== 'archived' && wallet.archived
        return wallet?.currency === currency && !isArchived
      })
      return acc
    },
    {} as Record<CurrencyCode, WalletId[]>,
  ),
)

const groupedWalletsByType = computed(() =>
  types.reduce(
    (acc, type) => {
      acc[type] = walletsStore.sortedIds.filter((id) => {
        const wallet = walletsStore.items?.[id]

        if (!wallet)
          return false

        const isCurrencyFiltered
          = currencyFiltered.value === 'all'
            ? true
            : wallet?.currency === currencyFiltered.value

        const isArchived = type !== 'archived' && wallet?.archived

        if (type === 'available') {
          return checkIsAvailable(wallet) && isCurrencyFiltered && !isArchived
        }

        return wallet[type as WalletTypes] && isCurrencyFiltered && !isArchived
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
    creditPossible: 0,
    credits: 0,
    isCash: 0,
    isCashless: 0,
    isDebt: 0,
    isDeposit: 0,
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

    if (!wallet.isExcludeTotal) {
      sum.total += itemValue
    }

    if (wallet.isCash)
      sum.isCash += itemValue

    if (wallet.isCashless)
      sum.isCashless += itemValue

    if (wallet.creditLimit) {
      sum.creditPossible
        = sum.creditPossible
        + +getAmountInBaseRate({
          amount: wallet.creditLimit ?? 0,
          currencyCode: wallet.currency ?? 'USD',
          noFormat: true,
        })
    }

    if (wallet.isDeposit)
      sum.isDeposit += itemValue

    if (wallet.isDebt)
      sum.isDebt += itemValue

    if (wallet.withdrawal)
      sum.withdrawal += itemValue

    if (wallet.isCredit)
      sum.credits += itemValue
  }

  return sum
})

function groupByWalletType(id: WalletId) {
  const wallet = walletsStore.items?.[id]
  if (!wallet)
    return
  if (wallet.isCash)
    return 'isCash'
  if (wallet.isDeposit)
    return 'isDeposit'
  if (wallet.isCredit)
    return 'isCredit'
  if (wallet.isCredit)
    return 'isCredit'
  if (wallet.isCashless)
    return 'isCashless'
  if (wallet.isDebt)
    return 'isDebt'
  if (checkIsAvailable(wallet) && !wallet.archived)
    return 'available'

  return 'other'
}

function groupByWalletCurrency(id: WalletId) {
  const wallet = walletsStore.items?.[id]
  return wallet?.currency
}

function countWalletsSum(
  walletsIds: WalletId[],
  isConvert = true,
  isExcludeTotal = false,
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

    if (isExcludeTotal && wallet.isExcludeTotal)
      return acc
    return acc + wallet.amount
  }, 0)
}

function checkIsAvailable(wallet: WalletItem) {
  return wallet?.isCredit || wallet?.withdrawal
}

const counts = computed(() => ({
  all: {
    id: 'all',
    isShow: true,
    value:
      totalInWallets.value.total
      - totalInWallets.value.credits
      - totalInWallets.value.isDebt,
  },
  withdrawal: {
    icon: 'UiIconWalletWithdrawal',
    id: 'withdrawal',
    isShow: gropedBy.value === 'list' && totalInWallets.value.withdrawal !== 0,
    value: totalInWallets.value.withdrawal,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  isCredit: {
    id: 'isCredit',
    isShow: gropedBy.value === 'list' && totalInWallets.value.credits !== 0,
    value: totalInWallets.value.credits,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  isCash: {
    id: 'isCash',
    isShow: gropedBy.value === 'list' && totalInWallets.value.isCash !== 0,
    value: totalInWallets.value.isCash,
  },
  isCashless: {
    id: 'isCashless',
    isShow: gropedBy.value === 'list' && totalInWallets.value.isCashless !== 0,
    value: totalInWallets.value.isCashless,
  },
  isDeposit: {
    icon: 'isDeposit',
    id: 'isDeposit',
    isShow: gropedBy.value === 'list' && totalInWallets.value.isDeposit !== 0,
    value: totalInWallets.value.isDeposit,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  isDebt: {
    id: 'isDebt',
    isShow: gropedBy.value === 'list' && totalInWallets.value.isDebt !== 0,
    value: totalInWallets.value.isDebt,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  creditPossible: {
    id: 'creditPossible',
    isShow: totalInWallets.value.creditPossible !== 0,
    value: totalInWallets.value.creditPossible + totalInWallets.value.credits,
  },
}))
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('wallets.name') }}</UiHeaderTitle>
      <template #actions>
        <UiHeaderLink @click="openModal('walletsSort')">
          <UiIconOrder class="size-5" />
        </UiHeaderLink>
        <UiHeaderLink @click="router.push('/wallets/new')">
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
            <UiTitle6>{{ t('filterByCurrency') }}</UiTitle6>
            {{ currencyFiltered === 'all' ? t('all') : currencyFiltered }}
          </UiBox1>

          <UiBox1 @click="isShowBaseCurrencyModal = true">
            <UiTitle6>{{ t('currenciesBase') }}</UiTitle6>
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
              {{ t('filterByCurrency') }}
              {{ currencyFiltered === 'all' ? '' : currencyFiltered }}
            </UiTitle88>
          </template>

          <template #default="{ toggle }">
            <UiTabs2 class="flex gap-1 px-2">
              <DateLinkItem
                :isActive="currencyFiltered === 'all'"
                @click="onSelectFilterCurrency('all', toggle)"
              >
                {{ t('all') }}
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

        <UiBox1 class="hidden md:grid" @click="isShowBaseCurrencyModal = true">
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
              v-for="(groupedWalletsIds, grouped) in groupBy(
                walletsIds,
                groupByWalletType,
              )"
              :key="grouped"
              class="border-item-5 ml-3 border-l pl-2"
              :storageKey="`finapp-wallets-show-${currency}-${grouped}`"
              :initStatus="false"
              :lineWidth="1"
              openPadding="!pb-3"
            >
              <template #header="{ toggle }">
                <div
                  class="flex grow items-center justify-between pr-3"
                  @click="toggle"
                >
                  <UiTitle8>{{ t(`money.totals.${grouped}`) }}</UiTitle8>
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
                  {{ t(`money.totals.${type}`) }} {{ walletsIds.length }}
                </UiTitle88>

                <div class="py-2">
                  <Amount
                    :amount="countWalletsSum(walletsIds)"
                    :currencyCode="currenciesStore.base"
                  />
                </div>
              </div>
            </template>

            <pre>
              {{ Object.keys(groupBy(walletsIds, groupByWalletCurrency)).length === 1 ? '1' : 'many' }}
            </pre>

            <UiToggle2
              v-for="(groupedWalletsIds, currency) in groupBy(
                walletsIds,
                groupByWalletCurrency,
              )"
              :key="currency"
              class="border-item-5 ml-3 border-l pl-2"
              :storageKey="`finapp-wallets-show-${type}-${currency}`"
              :initStatus="false"
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
  filterByCurrency: Filter by
  list: List
  type: Type
  currencies: Currencies
  currenciesBase: Base currency

ru:
  list: Список
  type: Тип
  currencies: Валюты
  filterByCurrency: Валюты кошельков
  currenciesBase: Основная валюта
</i18n>
