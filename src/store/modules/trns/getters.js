import moment from 'moment'
import orderBy from 'lodash/orderBy'

export default {
  trns(state) {
    return orderBy(state.all, trn => trn.date, 'desc')
  },

  getTrns: (state, getters) => (options) => {
    let trns = getters.trns

    function getTrnsInCategoryWithChildren(trns, categoryId) {
      const category = getters.categories.find(category => category.id === categoryId)
      const childCategories = getters.categories.filter(category => category.parentId === categoryId)
      let selectedTrns = []

      // Get trns from all child categories
      if (category.parentId === 0) {
        selectedTrns = trns.filter(trn => {
          return childCategories.filter(cat => cat.id === trn.categoryId).length || trn.categoryId === category.id
        })
      }

      // Get trns only from this category
      if (category.parentId !== 0) {
        selectedTrns = trns.filter(trn => trn.categoryId === categoryId)
      }
      return selectedTrns
    }

    // With options
    if (options) {
      // Transfers
      if (!options.showTransfers) {
        const transferCategory = getters.categories.find(trn => trn.name === 'Перевод')
        if (transferCategory) {
          trns = trns.filter(trn =>
            trn.categoryId !== transferCategory.id)
        }
      }

      if (options.startDate && options.endDate) {
        const starDateMoment = moment(options.startDate).startOf('day').valueOf()
        // cons
        trns = trns.filter(trn =>
          trn.date >= starDateMoment &&
          trn.date <= moment(options.endDate).endOf('day').valueOf())
      }

      if (options.accountId) {
        trns = trns.filter(trn => trn.accountId === options.accountId)
      }

      if (options.categoryId) {
        trns = getTrnsInCategoryWithChildren(trns, options.categoryId)
      }
    } else {
      const transferCategory = getters.categories.find(trn => trn.name === 'Перевод')
      if (transferCategory) {
        trns = trns.filter(trn =>
          trn.categoryId !== transferCategory.id)
      }
    }

    if (trns) {
      return orderBy(trns, trn => trn.date, 'desc')
    }
  }
}
