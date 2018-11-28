import moment from 'moment'

// setDate
// setFilterCategoryId
// setFilterDateNow
// setFilterWalletId
// setPeriod
// setPeriodNext
// setPeriodPrev
export default {
  toogleFilterModal (state) {
    state.showFilterModal = !state.showFilterModal
  },

  setDate (state, date) {
    state.date = moment(date).valueOf()
  },

  setFilterCategoryId (state, categoryId) {
    state.categoryId = categoryId
  },

  setFilterDateNow (state) {
    state.date = moment().valueOf()
  },

  setFilterWalletId (state, walletId) {
    state.walletId = walletId
  },

  setPeriod (state, period) {
    state.period = period
  },

  setPeriodNext (state, date) {
    state.date = date
  },

  setPeriodPrev (state, date) {
    state.date = date
  }
}
