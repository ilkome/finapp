import { computed, useContext } from '@nuxtjs/composition-api'
import dayjs from 'dayjs'

export default function useFilter () {
  const { store } = useContext()

  /**
   * Base
   */
  const trns = computed(() => store.state.trns.items)
  const trnsIds = computed(() => Object.keys(trns.value))
  const cats = computed(() => store.state.categories.items)
  const catsIds = computed(() => Object.keys(cats.value))

  /**
   * Get trns with params
   */
  function getTrnsIds (params:any) {
    if (trnsIds.value.length === 0) {
      return trnsIds.value
    }

    const { walletId, categoryId, date } = params || {}
    let ids = trnsIds.value

    // Wallet
    if (walletId) {
      ids = ids.filter(id =>
        trns.value[id].walletId === walletId ||
        trns.value[id].walletToId === walletId ||
        trns.value[id].walletFromId === walletId
      )
    }

    // Category
    if (categoryId) {
      const childCategoriesIds = catsIds.value
        .filter(id => cats.value[id].parentId === categoryId)

      if (childCategoriesIds.length) {
        ids = trnsIds.value.filter((trnId) => {
          const trnCategoryId = trns.value[trnId].categoryId
          for (const categoryId of childCategoriesIds) {
            if (trnCategoryId === categoryId) { return true }
          }
          return true
        })
      }
      else {
        ids = trnsIds.value
          .filter(id => trns.value[id].categoryId === categoryId)
      }
    }

    // Date
    if (date) {
      if (typeof date === 'object') {
        ids = trnsIds.value
          .filter(id =>
            trns.value[id].date >= dayjs(date.from).startOf('date') &&
            trns.value[id].date <= dayjs(date.to).endOf('date')
          )
      }
    }

    return ids
  }

  return {
    trnsIds,
    getTrnsIds
  }
}
