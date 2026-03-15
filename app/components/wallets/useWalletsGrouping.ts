import type { ComputedRef, Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { GroupedWallets, WalletsToggleMap } from '~/components/wallets/grouping'
import type { WalletId, WalletsGroupedBy } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { applyToggle, applyToggleAll, buildWalletGroups, computeToggleStatus } from '~/components/wallets/grouping'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type { GroupedWallets }

export function useWalletsGrouping(
  selectedWalletsIds: ComputedRef<WalletId[]>,
  groupedBy: Ref<WalletsGroupedBy>,
) {
  const { t } = useI18n()
  const walletsStore = useWalletsStore()

  const groupedBySecondary = useStorage(WALLET_STORAGE_KEYS.groupedBySecondary, {
    currency: false,
    type: false,
  })

  const walletsToggledMap = useStorage<WalletsToggleMap>(WALLET_STORAGE_KEYS.toggleMap, {} as WalletsToggleMap, localStorage, {
    mergeDefaults: true,
  })

  const groupedWalletsWithIds = computed<GroupedWallets | false>(() => {
    const useSecondary = groupedBy.value !== 'none' && !!groupedBySecondary.value[groupedBy.value]

    return buildWalletGroups(
      selectedWalletsIds.value,
      walletsStore.itemsComputed,
      groupedBy.value,
      useSecondary,
    )
  })

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
    toggleMap,
    toggleOpened,
    toggleSecondaryGrouping,
    typeGroupsStatus,
    walletsToggledMap,
  }
}
