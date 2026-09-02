import type { MaybeRefOrGetter } from 'vue'
import type { z } from 'zod/v4'

import type { CategoryId } from '~/components/categories/types'
import type { statNavigationSnapshotSchema } from '~/components/stat/navigation/schema'
import type { WalletId } from '~/components/wallets/types'

export type StatNavigationSnapshot = z.infer<typeof statNavigationSnapshotSchema>
export type StatNavigationSnapshotInput = Omit<StatNavigationSnapshot, 'createdAt' | 'version'>

export type StatNavigationStorageOptions = {
  id?: string
  now?: number
  storage?: Storage | null
}

export type StatNavigationReadOptions = Pick<StatNavigationStorageOptions, 'now' | 'storage'>

export type StatCategoryNavigationOptions = {
  snapshot: MaybeRefOrGetter<StatNavigationSnapshotInput | null>
  walletsIds: MaybeRefOrGetter<readonly WalletId[]>
}

export type StatWalletNavigationOptions = {
  categoriesIds: MaybeRefOrGetter<readonly CategoryId[]>
  snapshot: MaybeRefOrGetter<StatNavigationSnapshotInput | null>
}

export type StatCategoryRouteOptions = {
  categoryId: CategoryId
  isDrilldown: boolean
  snapshotId: string | null
  walletsIds: readonly WalletId[]
}

export type StatWalletRouteOptions = {
  categoriesIds: readonly CategoryId[]
  isDrilldown: boolean
  snapshotId: string | null
  walletId: WalletId
}
