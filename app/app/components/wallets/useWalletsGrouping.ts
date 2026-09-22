import type { ComputedRef, Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { GroupedWallets, WalletSortOrders, WalletsToggleMap } from '~/components/wallets/grouping'
import type { WalletId, WalletsGroupedBy } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { applyToggle, applyToggleAll, buildWalletGroups, computeToggleStatus, sortOrderKey, sortWalletGroups } from '~/components/wallets/grouping'
import { useWalletGroupingOptions } from '~/components/wallets/useWalletGroupingOptions'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type { GroupedWallets }

export function useWalletsGrouping(
  selectedWalletsIds: ComputedRef<WalletId[]>,
  groupedBy: Ref<WalletsGroupedBy>,
) {
  const walletsStore = useWalletsStore()
  const groupTabs = useWalletGroupingOptions()

  const groupedBySecondary = useStorage(WALLET_STORAGE_KEYS.groupedBySecondary, {
    currency: false,
    type: false,
  })

  const walletsToggledMap = useStorage<WalletsToggleMap>(WALLET_STORAGE_KEYS.toggleMap, {} as WalletsToggleMap, localStorage, {
    mergeDefaults: true,
  })

  const sortOrders = useStorage<WalletSortOrders>(WALLET_STORAGE_KEYS.sortOrders, {})

  const groupedWalletsWithIds = computed<GroupedWallets | false>(() => {
    const useSecondary = groupedBy.value !== 'none' && !!groupedBySecondary.value[groupedBy.value]

    const groups = buildWalletGroups(
      selectedWalletsIds.value,
      walletsStore.itemsComputed,
      groupedBy.value,
      useSecondary,
    )
    return groups ? sortWalletGroups(groups, groupedBy.value, sortOrders.value) : groups
  })

  function setSortOrder(path: string[], ids: string[]) {
    sortOrders.value = { ...sortOrders.value, [sortOrderKey(groupedBy.value, ...path)]: ids }
  }

  function toggleMap(groupPrimary: string, groupSecondary?: string) {
    walletsToggledMap.value = applyToggle(
      walletsToggledMap.value,
      groupedBy.value,
      groupPrimary,
      groupSecondary,
    )
  }

  const typeGroupsStatus = computed(() =>
    computeToggleStatus(walletsToggledMap.value, groupedBy.value),
  )

  function toggleOpened() {
    if (groupedBy.value === 'none' || !groupedWalletsWithIds.value)
      return

    walletsToggledMap.value = applyToggleAll(
      walletsToggledMap.value,
      groupedBy.value,
      groupedWalletsWithIds.value as GroupedWallets,
      !!groupedBySecondary.value[groupedBy.value],
      typeGroupsStatus.value,
    )
  }

  function toggleSecondaryGrouping() {
    if (groupedBy.value !== 'none')
      groupedBySecondary.value[groupedBy.value] = !groupedBySecondary.value[groupedBy.value]
  }

  const isSecondaryGroupingActive = computed(() =>
    groupedBy.value !== 'none' && !!groupedBySecondary.value[groupedBy.value],
  )

  return {
    groupedWalletsWithIds,
    groupTabs,
    isSecondaryGroupingActive,
    setSortOrder,
    toggleMap,
    toggleOpened,
    toggleSecondaryGrouping,
    typeGroupsStatus,
    walletsToggledMap,
  }
}
