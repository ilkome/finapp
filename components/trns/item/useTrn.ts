import { formatDate } from '~/utils/formatDate'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { TrnId, TrnItemFull } from '~/components/trns/types'

export default function useTrn() {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()

  function formatTrnItem(id: TrnId): TrnItemFull | string {
    if (!trnsStore?.items || !walletsStore?.items || !categoriesStore?.items)
      return 'Something missing'

    // Trn
    const trn = trnsStore.items[id]
    if (!trn)
      return 'Trn not found'

    // Category
    const category = categoriesStore.items[trn.categoryId]
    if (!category)
      return 'Category not found'

    // Parent category
    let categoryParent = null
    if (category.parentId) {
      categoryParent = categoriesStore.items[category.parentId]
      if (!categoryParent)
        return 'Parent Category not found'
    }

    // Date
    let dateFormatted = formatDate(trn.date, 'full')
    // @ts-expect-error todo
    dateFormatted = `${dateFormatted.weekday}, ${dateFormatted.day} ${dateFormatted.month} ${dateFormatted.year}`

    // Transaction
    if (trn.type !== 2) {
      // Wallet
      const wallet = walletsStore.items[trn.walletId]
      if (!wallet)
        return 'Wallet not found'

      return {
        id,
        ...trn,
        category,
        categoryParent,
        dateFormatted,
        wallet,
      }
    }

    if (trn.type === 2) {
      const expenseWalletId = trn.expenseWalletId || trn.walletFromId
      const expenseWallet = walletsStore.items[expenseWalletId]
      if (!expenseWallet)
        return 'Transfer expense Wallet not found'

      const incomeWalletId = trn.incomeWalletId || trn.walletToId
      const incomeWallet = walletsStore.items[incomeWalletId]
      if (!incomeWallet)
        return 'Transfer income Wallet not found'

      return {
        id,
        ...trn,
        category,
        categoryParent,
        dateFormatted,
        expenseWallet,
        incomeWallet,
      }
    }

    return 'Trn type not found'
  }

  return {
    formatDate,
    formatTrnItem,
  }
}
