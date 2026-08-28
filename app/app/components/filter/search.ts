import type { Categories, CategoryId } from '~/components/categories/types'
import type { WalletId, WalletsComputed } from '~/components/wallets/types'

export function searchWallets(query: string, items: WalletsComputed): WalletId[] {
  if (!query)
    return []
  return Object.keys(items).filter((id) => {
    const wallet = items[id]
    return wallet && !wallet.isArchived && wallet.name.toLowerCase().includes(query)
  })
}

export function searchCategories(query: string, items: Categories, hasChildren: (categoryId: CategoryId) => boolean): CategoryId[] {
  if (!query)
    return []
  const ids: CategoryId[] = []
  for (const id in items) {
    const cat = items[id]
    if (!cat || id === 'transfer' || id === 'adjustment' || hasChildren(id))
      continue
    const parent = items[cat.parentId]
    if (cat.name.toLowerCase().includes(query) || parent?.name.toLowerCase().includes(query))
      ids.push(id)
  }
  return ids.sort((a, b) => (items[a]?.name ?? '').localeCompare(items[b]?.name ?? ''))
}
