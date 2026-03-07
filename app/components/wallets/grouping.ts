import type { WalletId, WalletItem, WalletItemComputed, WalletsGroupedBy } from '~/components/wallets/types'

type WalletsGroupedByExcludedNone = Exclude<WalletsGroupedBy, 'none'>

export type WalletGroup = {
  groups?: Record<string, WalletId[]>
  ids: WalletId[]
}
export type GroupedWallets = Record<string, WalletGroup>

export type GroupToggleState = {
  groups?: Record<string, boolean>
  show?: boolean
}
type ToggleMapByGroup = Record<string, GroupToggleState>
export type WalletsToggleMap = Partial<Record<WalletsGroupedByExcludedNone, ToggleMapByGroup>>

export type ToggleStatus = {
  isAllOpen: boolean
  isAllOpenInside: boolean
  isAnyOpen: boolean
  isAnyOpenInside: boolean
}

const groupingStrategies = {
  currency: { primary: 'currency', secondary: 'type' },
  type: { primary: 'type', secondary: 'currency' },
} as const

export function groupWalletsByProperty(
  ids: WalletId[],
  wallets: Record<WalletId, WalletItemComputed>,
  property: keyof WalletItem,
): Record<string, WalletId[]> {
  return Object.groupBy(ids, (id) => {
    const wallet = wallets[id]
    return wallet ? String(wallet[property] || '') : ''
  }) as Record<string, WalletId[]>
}

export function buildWalletGroups(
  ids: WalletId[],
  wallets: Record<WalletId, WalletItemComputed>,
  groupedBy: WalletsGroupedBy,
  useSecondary: boolean,
): GroupedWallets | false {
  if (groupedBy === 'none')
    return false

  const strategy = groupingStrategies[groupedBy as WalletsGroupedByExcludedNone]
  if (!strategy)
    return false

  const primaryGrouped = groupWalletsByProperty(ids, wallets, strategy.primary)

  if (!useSecondary) {
    return Object.fromEntries(
      Object.entries(primaryGrouped).map(([key, groupIds]) => [key, { groups: {}, ids: groupIds }]),
    )
  }

  return Object.fromEntries(
    Object.entries(primaryGrouped).map(([key, groupIds]) => [
      key,
      {
        groups: groupWalletsByProperty(groupIds, wallets, strategy.secondary),
        ids: groupIds,
      },
    ]),
  )
}

export function computeToggleStatus(
  toggleMap: WalletsToggleMap,
  groupedBy: WalletsGroupedBy,
): ToggleStatus {
  if (groupedBy === 'none' || !toggleMap[groupedBy])
    return { isAllOpen: false, isAllOpenInside: false, isAnyOpen: false, isAnyOpenInside: false }

  const groups = toggleMap[groupedBy] || {}

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
}

export function applyToggle(
  toggleMap: WalletsToggleMap,
  groupedBy: WalletsGroupedBy,
  groupPrimary: string,
  groupSecondary?: string,
): WalletsToggleMap {
  if (groupedBy === 'none')
    return toggleMap

  const result = { ...toggleMap }
  result[groupedBy] ??= {}
  result[groupedBy]![groupPrimary] ??= { groups: {} }

  const primaryGroup = result[groupedBy]![groupPrimary]

  if (groupSecondary) {
    primaryGroup.groups ??= {}
    const current = primaryGroup.groups[groupSecondary]
    primaryGroup.groups[groupSecondary] = current === undefined ? false : !current
  }
  else {
    primaryGroup.groups ??= {}
    primaryGroup.show = primaryGroup.show === undefined ? false : !primaryGroup.show
  }

  return result
}

export function applyToggleAll(
  toggleMap: WalletsToggleMap,
  groupedBy: WalletsGroupedBy,
  groupedWallets: GroupedWallets,
  hasSecondary: boolean,
  status: ToggleStatus,
): WalletsToggleMap {
  if (groupedBy === 'none')
    return toggleMap

  const result = { ...toggleMap }
  result[groupedBy] ??= {}

  const { isAllOpen, isAllOpenInside } = status
  const newShow = !hasSecondary ? !isAllOpen : !(isAllOpen && isAllOpenInside)
  const updateSecondary = hasSecondary && isAllOpen && !isAllOpenInside

  for (const [groupPrimary, walletGroup] of Object.entries(groupedWallets)) {
    const primaryGroup = result[groupedBy]![groupPrimary] || { groups: {} }

    if (updateSecondary) {
      const secondaryKeys = Object.keys(walletGroup.groups ?? {})
      result[groupedBy]![groupPrimary] = {
        ...primaryGroup,
        groups: Object.fromEntries(secondaryKeys.map(k => [k, true])),
        show: true,
      }
    }
    else if (hasSecondary && !newShow) {
      const secondaryKeys = Object.keys(walletGroup.groups ?? {})
      result[groupedBy]![groupPrimary] = {
        ...primaryGroup,
        groups: Object.fromEntries(secondaryKeys.map(k => [k, false])),
        show: false,
      }
    }
    else {
      result[groupedBy]![groupPrimary] = {
        ...primaryGroup,
        show: newShow,
      }
    }
  }

  return result
}
