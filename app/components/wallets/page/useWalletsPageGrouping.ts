import type { ComputedRef, Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { WalletId, WalletItem, WalletsGroupedBy } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

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
export type GroupedWallets = Record<string, WalletGroup>

export function useWalletsPageGrouping(
  selectedWalletsIds: ComputedRef<WalletId[]>,
  groupedBy: Ref<WalletsGroupedBy>,
) {
  const { t } = useI18n()
  const walletsStore = useWalletsStore()

  const groupedBySecondary = useStorage('finapp-wallets-groupedBySecondary', {
    currency: false,
    type: false,
  })

  const walletsToggledMap = useStorage<WalletsToggleMap>('finapp-wallets-toggle-map', {} as WalletsToggleMap, localStorage, {
    mergeDefaults: true,
  })

  // Helper functions
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

      const currentValue = primaryGroup.groups[groupSecondary]
      primaryGroup.groups[groupSecondary] = currentValue === undefined ? false : !currentValue
    }
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
    const groupedWallets = groupedWalletsWithIds.value as GroupedWallets
    const hasSecondaryGrouping = !!groupedBySecondary.value[currentGroup]

    // Determine target state
    const newShow = !hasSecondaryGrouping ? !isAllOpen : !(isAllOpen && isAllOpenInside)
    const updateSecondary = hasSecondaryGrouping && isAllOpen && !isAllOpenInside

    for (const groupPrimary of Object.keys(groupedWallets)) {
      const primaryGroup = currentToggleMap[currentGroup]![groupPrimary] || { groups: {} }

      if (updateSecondary) {
        const secondaryKeys = Object.keys(groupedWallets[groupPrimary]?.groups ?? {})
        currentToggleMap[currentGroup]![groupPrimary] = {
          ...primaryGroup,
          groups: Object.fromEntries(secondaryKeys.map(k => [k, true])),
          show: true,
        }
      }
      else if (hasSecondaryGrouping && !newShow) {
        const secondaryKeys = Object.keys(groupedWallets[groupPrimary]?.groups ?? {})
        currentToggleMap[currentGroup]![groupPrimary] = {
          ...primaryGroup,
          groups: Object.fromEntries(secondaryKeys.map(k => [k, false])),
          show: false,
        }
      }
      else {
        currentToggleMap[currentGroup]![groupPrimary] = {
          ...primaryGroup,
          show: newShow,
        }
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
      label: t('wallets.page.none'),
    }, {
      id: 'type',
      label: t('wallets.page.type'),
    }]

    if (walletsStore.currenciesUsed.length > 1) {
      items.push({
        id: 'currency',
        label: t('wallets.page.currencies'),
      })
    }

    return items
  })

  return {
    groupedBySecondary,
    groupedWalletsWithIds,
    groupTabs,
    toggleMap,
    toggleOpened,
    typeGroupsStatus,
    walletsToggledMap,
  }
}
