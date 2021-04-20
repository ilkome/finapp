import dayjs from 'dayjs'

export default {
  setDate (state, date) {
    state.date = dayjs(date).valueOf()
  },

  setFilterCategoryId (state, categoryId) {
    state.categoryId = categoryId
  },

  setFilterDateNow (state) {
    state.date = dayjs().valueOf()
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
