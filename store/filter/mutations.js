import dayjs from 'dayjs'

export default {
  setDate(state, date) {
    state.date = dayjs(date).valueOf()
  },

  setFilterDateNow(state) {
    state.date = dayjs().valueOf()
  },

  setPeriod(state, period) {
    state.period = period
  },

  setPeriodNext(state, date) {
    state.date = date
  },

  setPeriodPrev(state, date) {
    state.date = date
  },

  // Wallets
  setFilterWalletsId(state, walletId) {
    if (state.walletsIds.includes(walletId))
      return
    state.walletsIds.push(walletId)
  },

  removeFilterWalletId(state, walletId) {
    state.walletsIds = state.walletsIds.filter(id => id !== walletId)
  },

  clearFilterWalletsIds(state) {
    state.walletsIds = []
  },

  // Cats
  setFilterCatsId(state, catId) {
    if (state.catsIds.includes(catId))
      return
    state.catsIds.push(catId)
  },

  removeFilterCategoryId(state, catId) {
    state.catsIds = state.catsIds.filter(id => id !== catId)
  },

  clearFilterCatsIds(state) {
    state.catsIds = []
  },
}
