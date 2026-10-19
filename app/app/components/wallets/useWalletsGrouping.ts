import type { ComputedRef, Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { GroupedWallets, WalletsToggleMap } from '~/components/wallets/grouping'
import type { WalletId, WalletsGroupedBy } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS, walletStorageKey } from '~/components/wallets/constants'
import { applyToggle, applyToggleAll, buildWalletGroups, computeToggleStatus, groupingPrimary, hasSecondaryGrouping, reorderInSlots } from '~/components/wallets/grouping'
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

  // Ids arrive in `sortOrder`, so groups and wallets inside them follow the one synced order.
  const groupedWalletsWithIds = computed<GroupedWallets | false>(() => buildWalletGroups(
    selectedWalletsIds.value,
    walletsStore.itemsComputed,
    primary.value,
    hasSecondary.value,
  ))

  /** `keys` are the new order of what sits at `path`: primary groups, secondary groups or wallet ids. */
  function setSortOrder(path: string[], keys: string[]) {
    const groups = groupedWalletsWithIds.value
    if (!groups)
      return
    const [primaryKey, secondaryKey] = path
    const group = primaryKey ? groups[primaryKey] : undefined
    const sequence = !primaryKey
      ? keys.flatMap(k => groups[k]?.ids ?? [])
      : secondaryKey || !Object.keys(group?.groups ?? {}).length
        ? keys
        : keys.flatMap(k => group?.groups?.[k] ?? [])
    walletsStore.saveWalletsOrder(reorderInSlots(walletsStore.sortedIds, sequence))
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
