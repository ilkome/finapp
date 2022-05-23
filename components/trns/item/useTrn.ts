import { formatDate } from '~/utils/formatDate'

export default function useTrn() {
  const { $store } = useNuxtApp()

  function formatTrnItem(id) {
    try {
      const { trns, wallets, categories } = $store.state

      if (!trns?.items || !wallets?.items || !categories?.items)
        return 'Something missing'

      // Trn
      const trn = trns.items[id]
      if (!trn)
        return 'Trn not found'

      // Category
      const category = categories.items[trn.categoryId]
      if (!category)
        return 'Category not found'

      // Parent category
      let categoryParent = null
      if (category.parentId) {
        categoryParent = categories.items[category.parentId]
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
        const wallet = wallets.items[trn.walletId]
        if (!wallet)
          return 'Wallet not found'

        return {
          id,
          ...trn,
          dateFormatted,
          category,
          categoryParent,
          wallet,
        }
      }

      if (trn.type === 2) {
        const expenseWalletId = trn.expenseWalletId || trn.walletFromId
        const expenseWallet = wallets.items[expenseWalletId]
        if (!expenseWallet)
          return 'Transfer expense Wallet not found'

        const incomeWalletId = trn.incomeWalletId || trn.walletToId
        const incomeWallet = wallets.items[incomeWalletId]
        if (!incomeWallet)
          return 'Transfer income Wallet not found'

        return {
          id,
          ...trn,
          dateFormatted,
          category,
          categoryParent,
          expenseWallet,
          incomeWallet,
        }
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  return {
    formatTrnItem,
    formatDate,
  }
}
