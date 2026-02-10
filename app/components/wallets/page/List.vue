<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItem, WalletsCurrencyFiltered, WalletsGroupedBy, WalletType, WalletViewTypes } from '~/components/wallets/types'

import { useAmount } from '~/components/amount/useAmount'
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
const currencyFiltered = useStorage<WalletsCurrencyFiltered>('finapp-wallets-active-currency', 'all')
const walletViewType = useStorage<WalletViewTypes | 'total'>('finapp-wallets-active-type', 'total')

function setWalletViewType(v: WalletType | 'total') {
  walletViewType.value = v
}

const groupedBy = useStorage<WalletsGroupedBy>('finapp-wallets-groupedBy', 'none')
const groupedBySecondary = useStorage('finapp-wallets-groupedBySecondary', {
  currency: false,
  type: false,
})

const selectedWalletsIdsWithCurrency = computed<WalletId[]>(() => {
  return Object.keys(walletsStore.itemsComputed).filter((id) => {
    const wallet = walletsStore.itemsComputed[id]
    if (groupedBy.value === 'currency')
      return true
    return currencyFiltered.value === 'all' || currencyFiltered.value === wallet?.currency
  })
})

const selectedWalletsIds = computed<WalletId[]>(() => {
  return selectedWalletsIdsWithCurrency.value.filter((id) => {
    const wallet = walletsStore.itemsComputed[id]!

    if (walletViewType.value === 'isWithdrawal')
      return wallet.isWithdrawal && !wallet.isArchived

    if (walletViewType.value === 'isExcludeInTotal')
      return wallet.isExcludeInTotal

    if (walletViewType.value === 'isArchived')
      return wallet.isArchived

    if (walletViewType.value === 'isAvailable')
      return (wallet.type === 'credit' || wallet.isWithdrawal) && !wallet.isArchived

    if (walletViewType.value === 'total')
      return !wallet.isArchived && !wallet.isExcludeInTotal

    return wallet.type === walletViewType.value
  })
})

const isShowCurrencyFilter = ref(false)

function onSelectFilterCurrency(code: CurrencyCode, toggle?: () => void) {
  if (currencyFiltered.value === code && toggle)
    toggle()

  walletViewType.value = 'total'
  currencyFiltered.value = code
  isShowCurrencyFilter.value = false
}

const counts = computed(() => {
  const sum = {
    archived: 0,
    available: 0,
    cash: 0,
    cashless: 0,
    credit: 0,
    creditPossible: 0,
    crypto: 0,
    debt: 0,
    deposit: 0,
    excludeInTotal: 0,
    total: 0,
    withdrawal: 0,
  }

  for (const walletId of selectedWalletsIdsWithCurrency.value) {
    const wallet = walletsStore.itemsComputed[walletId]
    if (!wallet)
      continue

    const itemValue
      = wallet.currency === currenciesStore.base
        ? (walletsStore.itemsComputed[walletId]?.amount ?? 0)
        : +getAmountInBaseRate({
            amount: walletsStore.itemsComputed[walletId]?.amount ?? 0,
            currencyCode: wallet.currency ?? 'USD',
            noFormat: true,
          })

    if (wallet.isExcludeInTotal) {
      sum.excludeInTotal += itemValue
    }
    else if (wallet.type !== 'credit') {
      sum.total += itemValue
    }

    if (wallet.type === 'cash')
      sum.cash += itemValue

    if (wallet.type === 'cashless')
      sum.cashless += itemValue
    if (wallet.type === 'crypto')
      sum.crypto += itemValue

    if (wallet.type === 'deposit')
      sum.deposit += itemValue

    if (wallet.type === 'debt')
      sum.debt += itemValue

    if (wallet.type === 'credit')
      sum.credit += itemValue

    if (wallet.type === 'credit' && wallet.creditLimit) {
      sum.creditPossible = sum.creditPossible + +getAmountInBaseRate({
        amount: wallet.creditLimit ?? 0,
        currencyCode: wallet.currency ?? 'USD',
        noFormat: true,
      })
    }

    if (wallet.isWithdrawal)
      sum.withdrawal += itemValue

    if (wallet.isArchived) {
      sum.archived += itemValue
    }
  }

  return {
    cash: {
      id: 'cash',
      isShow: Object.keys(walletsStore.itemsComputed).length > 1 && sum.cash !== 0,
      value: sum.cash,
    },
    // eslint-disable-next-line perfectionist/sort-objects
    available: {
      id: 'isAvailable',
      isShow: sum.withdrawal !== 0,
      value: sum.withdrawal - Math.abs(sum.credit),
    },

    cashless: {
      id: 'cashless',
      isShow: sum.cashless !== 0,
      value: sum.cashless,
    },

    credit: {
      id: 'credit',
      isShow: sum.credit !== 0,
      secondValue: sum.creditPossible,
      value: sum.credit,
    },

    crypto: {
      id: 'crypto',
      isShow: sum.crypto !== 0,
      value: sum.crypto,
    },

    debt: {
      id: 'debt',
      isShow: sum.debt !== 0,
      value: sum.debt,
    },

    deposit: {
      id: 'deposit',
      isShow: sum.deposit !== 0,
      value: sum.deposit,
    },

    total: {
      id: 'total',
      isShow: true,
      value: sum.total,
    },

    withdrawal: {
      id: 'isWithdrawal',
      isShow: sum.withdrawal !== 0,
      value: sum.withdrawal,
    },
    // eslint-disable-next-line perfectionist/sort-objects
    excludeInTotal: {
      id: 'isExcludeInTotal',
      isShow: sum.excludeInTotal !== 0,
      value: sum.excludeInTotal,
    },
    // eslint-disable-next-line perfectionist/sort-objects
    archived: {
      id: 'isArchived',
      isShow: selectedWalletsIdsWithCurrency.value.some(wallet => walletsStore.itemsComputed[wallet]?.isArchived),
      value: sum.archived,
    },
  }
})

type WalletsGroupedByExcludedNone = Exclude<WalletsGroupedBy, 'none'>
type WalletGroup = {
  groups?: Record<string, WalletId[]>
  ids: WalletId[]
}
type GroupToggleState = {
  groups?: Record<string, boolean>
  show?: boolean
}
type ToggleMapByGroup = Record<string, GroupToggleState>
type WalletsToggleMap = Partial<Record<WalletsGroupedByExcludedNone, ToggleMapByGroup>>
type GroupedWallets = Record<string, WalletGroup>

// Update the storage definition with proper type and default value
const walletsToggledMap = useStorage<WalletsToggleMap>('finapp-wallets-toggle-map', {} as WalletsToggleMap, localStorage, {
  mergeDefaults: true,
})

// Helper functions to improve readability
function groupWalletsByStrategy(ids: WalletId[], strategy: keyof WalletItem): Record<string, WalletId[]> {
  return Object.groupBy(ids, (id) => {
    const wallet = walletsStore.itemsComputed[id]
    return wallet ? String(wallet[strategy] || '') : ''
  }) as Record<string, WalletId[]>
}

function createPrimaryGroups(grouped: Record<string, WalletId[]>): GroupedWallets {
  return Object.entries(grouped).reduce<GroupedWallets>((acc, [key, ids]) => {
    acc[key] = { groups: {}, ids }
    return acc
  }, {})
}

function createSecondaryGroups(grouped: Record<string, WalletId[]>, secondaryStrategy: keyof WalletItem): GroupedWallets {
  return Object.entries(grouped).reduce<GroupedWallets>((acc, [key, ids]) => {
    acc[key] = {
      groups: groupWalletsByStrategy(ids, secondaryStrategy),
      ids,
    }
    return acc
  }, {})
}

const groupedWalletsWithIds = computed<GroupedWallets | false>(() => {
  if (groupedBy.value === 'none')
    return false

  const groupingStrategies = {
    currency: {
      primary: 'currency',
      secondary: 'type',
    },
    type: {
      primary: 'type',
      secondary: 'currency',
    },
  } as const

  const strategy = groupingStrategies[groupedBy.value as WalletsGroupedByExcludedNone]
  if (!strategy)
    return false

  const ids = selectedWalletsIds.value
  const primaryGrouped = groupWalletsByStrategy(ids, strategy.primary)

  let useSecondaryGrouping = false
  if (groupedBy.value === 'currency') {
    useSecondaryGrouping = !!groupedBySecondary.value.currency
  }
  else if (groupedBy.value === 'type') {
    useSecondaryGrouping = !!groupedBySecondary.value.type
  }

  return useSecondaryGrouping
    ? createSecondaryGroups(primaryGrouped, strategy.secondary)
    : createPrimaryGroups(primaryGrouped)
})

function toggleMap(groupPrimary: string, groupSecondary?: string) {
  const currentGroup = groupedBy.value
  if (currentGroup === 'none')
    return

  const currentToggleMap = { ...walletsToggledMap.value }
  currentToggleMap[currentGroup] ??= {}

  if (!currentToggleMap[currentGroup]![groupPrimary])
    currentToggleMap[currentGroup]![groupPrimary] = { groups: {} }

  if (groupSecondary) {
    const primaryGroup = currentToggleMap[currentGroup]![groupPrimary]
    primaryGroup.groups ??= {}

    // Toggle the secondary group
    const currentValue = primaryGroup.groups[groupSecondary]
    primaryGroup.groups[groupSecondary] = currentValue === undefined ? false : !currentValue
  }
  // Handle primary group toggle
  else {
    const primaryGroup = currentToggleMap[currentGroup]![groupPrimary]
    primaryGroup.groups ??= {}
    primaryGroup.show = primaryGroup.show === undefined ? false : !primaryGroup.show
  }

  walletsToggledMap.value = currentToggleMap
}

const typeGroupsStatus = computed(() => {
  const currentGroup = groupedBy.value
  if (currentGroup === 'none' || !walletsToggledMap.value[currentGroup])
    return { isAllOpen: false, isAllOpenInside: false, isAnyOpen: false, isAnyOpenInside: false }

  const groups = walletsToggledMap.value[currentGroup] || {}

  return {
    isAllOpen: Object.values(groups).every(group => !!group.show),
    isAllOpenInside: Object.values(groups).every(group =>
      Object.values(group.groups || {}).every(isOpen => !!isOpen),
    ),
    isAnyOpen: Object.values(groups).some(group => !!group.show),
    isAnyOpenInside: Object.values(groups).some(group =>
      Object.values(group.groups || {}).some(isOpen => !!isOpen),
    ),
  }
})

function toggleOpened() {
  const currentGroup = groupedBy.value
  if (currentGroup === 'none' || !groupedWalletsWithIds.value)
    return

  const currentToggleMap = { ...walletsToggledMap.value }
  currentToggleMap[currentGroup] ??= {}

  const { isAllOpen, isAllOpenInside } = typeGroupsStatus.value
  const groupPrimaries = Object.keys(groupedWalletsWithIds.value)

  // We know groupedWalletsWithIds.value is not false at this point
  const groupedWallets = groupedWalletsWithIds.value as GroupedWallets

  // Check if we're using secondary grouping
  let hasSecondaryGrouping = false
  if (currentGroup === 'currency') {
    hasSecondaryGrouping = !!groupedBySecondary.value.currency
  }
  else if (currentGroup === 'type') {
    hasSecondaryGrouping = !!groupedBySecondary.value.type
  }

  // If we don't have secondary grouping, just toggle the primary groups' show property
  if (!hasSecondaryGrouping) {
    // If all primary groups are open, close them all
    // Otherwise, open them all
    const newShowState = !isAllOpen

    groupPrimaries.forEach((groupPrimary) => {
      const primaryGroup = currentToggleMap[currentGroup]![groupPrimary] || { groups: {} }

      currentToggleMap[currentGroup]![groupPrimary] = {
        ...primaryGroup,
        show: newShowState,
      }
    })
  }
  // If we have secondary grouping, handle the three cases as before
  else {
    // Case 1: All primary groups are open but not all inner groups are open
    // Set all inner groups to true
    if (isAllOpen && !isAllOpenInside) {
      groupPrimaries.forEach((groupPrimary) => {
        const primaryGroup = currentToggleMap[currentGroup]![groupPrimary] || { groups: {}, show: true }

        // Get all secondary groups for this primary group
        const walletGroup = groupedWallets[groupPrimary]
        const secondaryGroups = walletGroup && walletGroup.groups ? walletGroup.groups : {}

        // Set all inner groups to true
        currentToggleMap[currentGroup]![groupPrimary] = {
          ...primaryGroup,
          groups: Object.keys(secondaryGroups).reduce((acc, groupSecondary) => {
            acc[groupSecondary] = true
            return acc
          }, { ...primaryGroup.groups }),
          show: true,
        }
      })
    }
    // Case 2: All primary groups and all inner groups are open
    // Set everything to false
    else if (isAllOpen && isAllOpenInside) {
      groupPrimaries.forEach((groupPrimary) => {
        const primaryGroup = currentToggleMap[currentGroup]![groupPrimary] || { groups: {}, show: false }

        // Get all secondary groups for this primary group
        const walletGroup = groupedWallets[groupPrimary]
        const secondaryGroups = walletGroup && walletGroup.groups ? walletGroup.groups : {}

        // Set primary show to false and all inner groups to false
        currentToggleMap[currentGroup]![groupPrimary] = {
          ...primaryGroup,
          groups: Object.keys(secondaryGroups).reduce((acc, groupSecondary) => {
            acc[groupSecondary] = false
            return acc
          }, { ...primaryGroup.groups }),
          show: false,
        }
      })
    }
    // Case 3: Not all primary groups are open
    else {
      groupPrimaries.forEach((groupPrimary) => {
        const primaryGroup = currentToggleMap[currentGroup]![groupPrimary] || { groups: {} }

        currentToggleMap[currentGroup]![groupPrimary] = {
          ...primaryGroup,
          show: true,
        }
      })
    }
  }

  walletsToggledMap.value = currentToggleMap
}

const groupTabs = computed(() => {
  const items: {
    id: WalletsGroupedBy
    label: string
  }[] = [{
    id: 'none',
    label: t('none'),
  }, {
    id: 'type',
    label: t('type'),
  }]

  if (walletsStore.currenciesUsed.length > 1) {
    items.push({
      id: 'currency',
      label: t('currencies'),
    })
  }

  return items
})

function countWalletsSum(
  walletsIds: WalletId[],
  isConvert = true,
) {
  return walletsIds.reduce((acc, id) => {
    const wallet = walletsStore.itemsComputed[id]
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

    if (wallet.isExcludeInTotal)
      return acc
    return acc + wallet.amount
  }, 0)
}

const isOpen = ref(false)
</script>

<template>
  <UiPage>
    <!-- Header -->
    <UiHeader>
      <UiHeaderTitle>{{ t('wallets.name') }}</UiHeaderTitle>

      <template #actions>
        <UiItem3 @click="router.push('/wallets/new')">
          <Icon name="lucide:plus" size="24" />
        </UiItem3>

        <BottomSheetOrDropdown
          :isOpen="isOpen"
          isShowCloseBtn
          @onCloseModal="isOpen = false"
          @onOpenModal="isOpen = true"
        >
          <template #trigger>
            <UiItem1>
              <Icon name="lucide:ellipsis-vertical" size="20" />
            </UiItem1>
          </template>

          <template #content>
            <div class="p-1 pt-4 pb-3">
              <UiHeaderLink
                v-if="walletsStore.sortedIds.length > 1"
                icon="lucide:arrow-down-up"
                @click="openModal('walletsSort')"
              >
                {{ t('wallets.sortTitle') }}
              </UiHeaderLink>
            </div>
          </template>
        </BottomSheetOrDropdown>
      </template>
    </UiHeader>

    <!-- Empty -->
    <div
      v-if="!walletsStore.hasItems"
      class="pageWrapper"
    >
      <div class="@xl/page:max-w-xs">
        <UiButtonAccent
          @click="router.push('/wallets/new')"
        >
          {{ t('wallets.new') }}
        </UiButtonAccent>
      </div>
    </div>

    <!-- Content -->
    <div
      v-else
      class="grid max-w-5xl grow px-2 lg:px-4 2xl:px-8 @xl/page:grid-cols-2 @xl/page:gap-6 @3xl/page:gap-12"
    >
      <!-- Right -->
      <div class="grid content-start gap-3 @xl/page:order-1 @xl/page:gap-4 @xl/page:pt-1 @3xl/main:max-w-sm">
        <!-- Wallets Currencies -->
        <WalletsCurrencies
          v-if="walletsStore.currenciesUsed.length > 1 && groupedBy !== 'currency'"
          :currencyFiltered
          @onSelectFilterCurrency="code => currencyFiltered = code"
        />

        <!-- Total -->
        <div class="flex flex-wrap justify-stretch gap-2 @2xl/page:justify-start">
          <StatSumItem
            :title="t('money.types.total')"
            :amount="counts.total.value"
            type="netIncome"
            @click="setWalletViewType(counts.total.id)"
          />
          <StatSumItem
            v-if="counts.available.value !== 0 && counts.available.value !== counts.total.value"
            :title="t('money.types.available')"
            :amount="counts.available.value"
            type="netIncome"
            @click="setWalletViewType(counts.available.id)"
          />
        </div>

        <WalletsStatistics
          :storageKey="`finapp-wallets-total-${groupedBy}`"
          :activeType="walletViewType"
          :currencyCode="currenciesStore.base"
          :counts="counts"
          @click="setWalletViewType"
        />
      </div>

      <!-- Left content -->
      <div class="@3xl/main:max-w-sm">
        <div class="mb-2 flex min-h-12 items-center gap-2 md:pt-2 ">
          <UiTabs2>
            <UiTabsItem4
              v-for="item in groupTabs"
              :key="item.id"
              :isActive="item.id === groupedBy"
              @click="groupedBy = item.id"
            >
              {{ item.label }}
            </UiTabsItem4>
          </UiTabs2>

          <div
            v-if="groupedBy !== 'none'"
            class="ml-auto flex items-center gap-1"
          >
            <UiItem1
              @click="
                groupedBy === 'currency'
                  ? groupedBySecondary.currency = !groupedBySecondary.currency
                  : groupedBy === 'type'
                    ? groupedBySecondary.type = !groupedBySecondary.type
                    : null
              "
            >
              <Icon
                :name="
                  (groupedBy === 'currency' && groupedBySecondary.currency)
                    || (groupedBy === 'type' && groupedBySecondary.type)
                    ? 'lucide:network'
                    : 'lucide:folder-tree'
                "
                size="18"
              />
            </UiItem1>

            <UiItem1 @click="toggleOpened">
              <Icon
                v-if="typeGroupsStatus.isAllOpen"
                name="lucide:folder-open"
              />
              <Icon
                v-else-if="typeGroupsStatus.isAnyOpen"
                name="lucide:folder-open-dot"
              />
              <Icon
                v-else
                name="lucide:folder"
              />
            </UiItem1>
          </div>
        </div>

        <!-- Wallets List -->
        <div class="md:max-w-lg @xl/page:max-w-lg">
          <!-- No grouping -->
          <div
            v-if="groupedBy === 'none'"
            class="border-item-4 bg-item-2 rounded-xl md:max-w-lg"
          >
            <WalletsItem
              v-for="walletId in selectedWalletsIds"
              :key="walletId"
              :wallet="walletsStore.itemsComputed[walletId]!"
              :walletId
              :lineWidth="2"
              class="group"
              isShowBaseRate
              isShowIcon
              isShowRate
              isShowCreditLimit
              @click="router.push(`/wallets/${walletId}`)"
            />
          </div>

          <!-- Grouping -->
          <div
            v-if="groupedBy !== 'none' && groupedWalletsWithIds"
            class="grid gap-4"
          >
            <UiToggle3
              v-for="(content, groupPrimary) in groupedWalletsWithIds"
              :key="groupPrimary"
              :class="{
                'bg-item-2 rounded-sm': Object.keys(content.groups ?? {}).length === 0,
              }"
              :isShown="
                walletsToggledMap[groupedBy]?.[groupPrimary]?.show ?? true
              "
            >
              <template #header="{ isShown }">
                <UiTitleDropRight
                  :isShown
                  @click="toggleMap(groupPrimary)"
                >
                  <div class="font-tertiary !text-3 text-base leading-none font-semibold">
                    {{ groupedBy === 'type' ? t(`money.types.${groupPrimary}`) : groupPrimary }}
                  </div>

                  <div class="ml-auto opacity-60">
                    <Amount
                      :amount="countWalletsSum(content.ids)"
                      :currencyCode="currenciesStore.base"
                      :isShowBaseRate="false"
                      variant="sm"
                    />
                    <Amount
                      v-if="groupedBy === 'currency' && currenciesStore.base !== groupPrimary"
                      :amount="countWalletsSum(content.ids, false)"
                      :currencyCode="groupPrimary"
                      :isShowBaseRate="false"
                      variant="2xs"
                    />
                  </div>
                </UiTitleDropRight>
              </template>

              <div
                v-if="Object.keys(content.groups ?? {}).length > 0"
                class="grid gap-2"
              >
                <UiToggle3
                  v-for="(ids, groupSecondary) in content.groups"
                  :key="groupSecondary"
                  :isShown="
                    walletsToggledMap[groupedBy]?.[groupPrimary]?.groups?.[groupSecondary] ?? true
                  "
                  class="_border border-item-4 bg-item-2 group grid gap-1 rounded-xl"
                >
                  <template #header="{ isShown }">
                    <UiTitleDropRight
                      :isShown
                      @click="toggleMap(groupPrimary, groupSecondary)"
                    >
                      <div class="font-tertiary text-base leading-none font-semibold">
                        {{ groupedBy === 'currency' ? t(`money.types.${groupSecondary}`) : groupSecondary }}
                      </div>
                      <div class="ml-auto">
                        <Amount
                          :amount="countWalletsSum(ids)"
                          :currencyCode="currenciesStore.base"
                          :isShowBaseRate="false"
                        />
                        <Amount
                          v-if="groupedBy === 'currency' && currenciesStore.base !== groupPrimary"
                          :amount="countWalletsSum(ids, false)"
                          :currencyCode="groupPrimary"
                          :isShowBaseRate="false"
                          variant="2xs"
                        />
                      </div>
                    </UiTitleDropRight>
                  </template>

                  <WalletsItem
                    v-for="walletId in ids"
                    :key="walletId"
                    :lineWidth="2"
                    :wallet="walletsStore.itemsComputed[walletId]!"
                    :walletId
                    class="group"
                    isShowBaseRate
                    isShowCreditLimit
                    isShowIcon
                    isShowRate
                    @click="router.push(`/wallets/${walletId}`)"
                  />
                </UiToggle3>
              </div>

              <template v-else>
                <WalletsItem
                  v-for="walletId in content.ids"
                  :key="walletId"
                  :lineWidth="2"
                  :wallet="walletsStore.itemsComputed[walletId]!"
                  :walletId
                  class="group"
                  isShowBaseRate
                  isShowCreditLimit
                  isShowIcon
                  isShowRate
                  @click="router.push(`/wallets/${walletId}`)"
                />
              </template>
            </UiToggle3>
          </div>
        </div>
      </div>
    </div>
  </UiPage>

  <!-- Sort Modal -->
  <WalletsSortModal v-if="isModalOpen('walletsSort')" />

  <!-- Base Currency Modal -->
  <CurrenciesModal
    v-if="isShowBaseCurrencyModal"
    :activeCode="currenciesStore.base"
    @onSelect="currenciesStore.setBase"
    @onClose="isShowBaseCurrencyModal = false"
  />

  <!-- Currency Filter Modal -->
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
  none: List
  type: Type

ru:
  currencies: Валюты
  none: Список
  type: Тип
</i18n>
