import { useNuxtApp } from '#app'
import { formatDate } from '~/utils/formatDate'

export default function useTrn () {
  const { $store } = useNuxtApp()

  function formatTrnItem (id) {
    try {
      const { trns, wallets, categories } = $store.state

      if (!trns?.items || !wallets?.items || !categories?.items)
        return 'Something missing'

      // Trn
      const trn = trns.items[id]
      if (!trn)
        return 'Trn not found'

      // Wallet
      const wallet = wallets.items[trn.walletId]
      if (!wallet)
        return 'Wallet not found'

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

      // Transfer from
      let walletFrom = null
      if (trn.walletFromId) {
        walletFrom = wallets.items[trn.walletFromId]
        if (!walletFrom)
          return 'Transfer WalletFrom not found'
      }

      // Transfer to
      let walletTo = null
      if (trn.walletToId) {
        walletTo = wallets.items[trn.walletToId]
        if (!walletTo)
          return 'Transfer WalletTo not found'
      }

      // Date
      let dateFormated = formatDate(trn.date, 'full')
      // @ts-ignore
      dateFormated = `${dateFormated.weekday}, ${dateFormated.day} ${dateFormated.month} ${dateFormated.year}`

      return {
        id,
        ...trn,
        dateFormated,
        category,
        categoryParent,
        walletFrom,
        walletTo,
        wallet
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  return {
    formatTrnItem,
    formatDate
  }
}
