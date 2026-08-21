import type { CommandPaletteItem } from '@nuxt/ui'

import type { CategoryId } from '~/components/categories/types'
import type { TransactionFull, TransferFull, TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type SearchResultItem = CommandPaletteItem & {
  entityId: string
  entityType: 'category' | 'trn' | 'wallet'
}

export const isSearchOpen = ref(false)
export const searchTerm = ref('')

export function useSearch() {
  const { t } = useI18n()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()

  const allCategoryItems = computed(() => {
    const items: SearchResultItem[] = []
    if (!categoriesStore.items)
      return items

    for (const id of Object.keys(categoriesStore.items)) {
      if (id === 'transfer' || id === 'adjustment')
        continue

      const category = categoriesStore.items[id as CategoryId]
      if (!category)
        continue

      let label = category.name
      if (category.parentId) {
        const parent = categoriesStore.items[category.parentId as CategoryId]
        if (parent)
          label = `${parent.name} - ${category.name}`
      }

      items.push({
        entityId: id,
        entityType: 'category',
        icon: category.icon,
        id: `category-${id}`,
        label,
        suffix: category.color,
      })
    }

    return items
  })

  const allWalletItems = computed(() => {
    const items: SearchResultItem[] = []
    if (!walletsStore.items)
      return items

    for (const id of walletsStore.sortedIds) {
      const wallet = walletsStore.items[id as WalletId]
      if (!wallet)
        continue

      items.push({
        entityId: id,
        entityType: 'wallet',
        id: `wallet-${id}`,
        label: wallet.name,
        search: [wallet.name, wallet.desc].filter(Boolean).join(' '),
        suffix: wallet.desc,
      })
    }

    return items
  })

  const allTrnItems = computed(() => {
    const items: SearchResultItem[] = []
    if (!trnsStore.items)
      return items

    const trnIds = Object.keys(trnsStore.items) as TrnId[]
    const sortedIds = trnIds.sort((a, b) => {
      const trnA = trnsStore.items![a]
      const trnB = trnsStore.items![b]
      return (trnB?.date ?? 0) - (trnA?.date ?? 0)
    })

    for (const id of sortedIds) {
      const trn = trnsStore.items[id]
      if (!trn)
        continue

      const computed = trnsStore.computeTrnItem(id)
      if (!computed)
        continue

      const searchParts: string[] = []

      if (computed.category)
        searchParts.push(computed.category.name)
      if (computed.categoryParent)
        searchParts.push(computed.categoryParent.name)

      if (trn.type === TrnType.Transfer) {
        const transfer = computed as TransferFull
        if (transfer.expenseWallet)
          searchParts.push(transfer.expenseWallet.name)
        if (transfer.incomeWallet)
          searchParts.push(transfer.incomeWallet.name)
      }
      else {
        const transaction = computed as TransactionFull
        if (transaction.wallet)
          searchParts.push(transaction.wallet.name)
      }

      if (trn.desc)
        searchParts.push(trn.desc)

      let label = computed.category?.name ?? ''
      if (trn.desc)
        label = `${label} - ${trn.desc}`

      items.push({
        entityId: id,
        entityType: 'trn',
        id: `trn-${id}`,
        label,
        search: searchParts.join(' '),
      })
    }

    return items
  })

  const groups = computed(() => {
    if (!searchTerm.value.trim())
      return []

    return [
      {
        id: 'categories',
        items: allCategoryItems.value,
        label: t('categories.name'),
        slot: 'category-item',
      },
      {
        id: 'wallets',
        items: allWalletItems.value,
        label: t('wallets.name'),
        slot: 'wallet-item',
      },
      {
        id: 'trns',
        items: allTrnItems.value,
        label: t('trns.history'),
        slot: 'trn-item',
      },
    ]
  })

  return {
    groups,
    isSearchOpen,
    searchTerm,
  }
}
