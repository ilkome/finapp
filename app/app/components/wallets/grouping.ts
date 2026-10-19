import type { WalletId, WalletItem, WalletItemComputed, WalletsGroupedBy, WalletsPrimaryGrouping } from '~/components/wallets/types'

type WalletsGroupedByExcludedNone = Exclude<WalletsGroupedBy, 'none'>

type WalletGroup = {
  groups?: Record<string, WalletId[]>
  ids: WalletId[]
}
export type GroupedWallets = Record<string, WalletGroup>

type GroupToggleState = {
  groups?: Record<string, boolean>
  show?: boolean
}
type ToggleMapByGroup = Record<string, GroupToggleState>
export type WalletsToggleMap = Partial<Record<WalletsGroupedByExcludedNone, ToggleMapByGroup>>

type ToggleStatus = {
  isAllOpen: boolean
  isAllOpenInside: boolean
  isAnyOpen: boolean
  isAnyOpenInside: boolean
}

const primaryByGrouping: Record<WalletsGroupedBy, WalletsPrimaryGrouping> = {
  currency: 'currency',
  currencyType: 'currency',
  none: 'none',
  type: 'type',
  typeCurrency: 'type',
}

export const groupingPrimary = (groupedBy: WalletsGroupedBy) => primaryByGrouping[groupedBy]
export const hasSecondaryGrouping = (groupedBy: WalletsGroupedBy) => groupedBy === 'typeCurrency' || groupedBy === 'currencyType'

const groupingStrategies = {
  currency: { primary: 'currencyCode', secondary: 'type' },
  type: { primary: 'type', secondary: 'currencyCode' },
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

// By type, flagged wallets leave their type group for trailing groups, in this order; the first match wins.
const FLAG_GROUPS = ['isExcludedFromTotal', 'isArchived'] as const

export function buildWalletGroups(
  ids: WalletId[],
  wallets: Record<WalletId, WalletItemComputed>,
  groupedBy: WalletsPrimaryGrouping,
  useSecondary: boolean,
): GroupedWallets | false {
  if (groupedBy === 'none')
    return false

  const strategy = groupingStrategies[groupedBy]

  const flagOf = (id: WalletId) => groupedBy === 'type'
    ? (wallets[id]?.isExcludedFromTotal ? 'isExcludedFromTotal' : wallets[id]?.isArchived ? 'isArchived' : undefined)
    : undefined
  const primaryGrouped = groupWalletsByProperty(ids.filter(id => !flagOf(id)), wallets, strategy.primary)
  for (const flag of FLAG_GROUPS) {
    const flagged = ids.filter(id => flagOf(id) === flag)
    if (flagged.length)
      primaryGrouped[flag] = flagged
  }

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

/** Puts `sequence` into the slots its ids hold in `order`; every other id keeps its place. */
export function reorderInSlots<T extends string>(order: T[], sequence: T[]): T[] {
  const moved = new Set(sequence)
  const result = [...order]
  let next = 0
  for (let i = 0; i < result.length; i++) {
    if (moved.has(result[i]!))
      result[i] = sequence[next++]!
  }
  return result
}
