import type { ComputedRef, Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { GroupedWallets, WalletSortOrders, WalletsToggleMap } from '~/components/wallets/grouping'
import type { WalletId, WalletsGroupedBy } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS, walletStorageKey } from '~/components/wallets/constants'
import { applyToggle, applyToggleAll, buildWalletGroups, computeToggleStatus, groupingPrimary, hasSecondaryGrouping, sortOrderKey, sortWalletGroups } from '~/components/wallets/grouping'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type { GroupedWallets }

export function useWalletsGrouping(
  selectedWalletsIds: ComputedRef<WalletId[]>,
  groupedBy: Ref<WalletsGroupedBy>,
  scope?: string,
) {
  const walletsStore = useWalletsStore()

  const primary = computed(() => groupingPrimary(groupedBy.value))
  const hasSecondary = computed(() => hasSecondaryGrouping(groupedBy.value))

  const walletsToggledMap = useStorage<WalletsToggleMap>(walletStorageKey(WALLET_STORAGE_KEYS.toggleMap, scope), {} as WalletsToggleMap, localStorage, {
    mergeDefaults: true,
  })

  const sortOrders = useStorage<WalletSortOrders>(WALLET_STORAGE_KEYS.sortOrders, {})

  const groupedWalletsWithIds = computed<GroupedWallets | false>(() => {
    const groups = buildWalletGroups(
      selectedWalletsIds.value,
      walletsStore.itemsComputed,
      primary.value,
      hasSecondary.value,
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
      hasSecondary.value,
      typeGroupsStatus.value,
    )
  }

  return {
    groupedWalletsWithIds,
    primary,
    setSortOrder,
    toggleMap,
    toggleOpened,
    typeGroupsStatus,
    walletsToggledMap,
  }
}
