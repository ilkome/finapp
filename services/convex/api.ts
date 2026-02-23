import type { Categories, CategoryItem } from '~/components/categories/types'
import type { TrnItem, Trns } from '~/components/trns/types'
import type { WalletItem, Wallets } from '~/components/wallets/types'

type ConvexDoc = {
  [key: string]: unknown
  _creationTime: number
  _id: string
  userId: string
}

function arrayToMap<T>(docs: ConvexDoc[]): Record<string, T> {
  const map: Record<string, T> = {}
  for (const doc of docs) {
    const { _creationTime, _id, userId, ...rest } = doc
    map[_id] = rest as T
  }
  return map
}

export function convexWalletsToMap(wallets: ConvexDoc[]): Wallets {
  return arrayToMap<WalletItem>(wallets)
}

export function convexCategoriesToMap(categories: ConvexDoc[]): Categories {
  return arrayToMap<CategoryItem>(categories)
}

export function convexTrnsToMap(trns: ConvexDoc[]): Trns {
  return arrayToMap<TrnItem>(trns)
}
