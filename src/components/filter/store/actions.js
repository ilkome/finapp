import moment from 'moment'
import localforage from 'localforage'

export default {
  handleSetFilterCategory ({ rootState, dispatch }, categoryId) {
    const filterCategoryId = rootState.filter.categoryId
    const filterCategory = rootState.categories.items[filterCategoryId]

    if (filterCategoryId === categoryId) {
      if (filterCategory.parentId !== 0) {
        dispatch('setFilterCategoryId', null)
        dispatch('setFilterCategoryId', filterCategory.parentId)
      } else {
        dispatch('setFilterCategoryId', null)
      }
    } else {
      dispatch('setFilterCategoryId', categoryId)
    }
  },

  setFilterCategoryId ({ state, commit }, categoryId) {
    state.categoryId === categoryId
      ? commit('setFilterCategoryId', null)
      : commit('setFilterCategoryId', categoryId)
  },

  setFilterWalletId ({ state, commit }, walletId) {
    state.categoryId === walletId
      ? commit('setFilterWalletId', null)
      : commit('setFilterWalletId', walletId)
  },

  setPeriod ({ commit }, period) {
    commit('setPeriod', period)
    commit('setDate', moment().valueOf())
    localforage.setItem('next.filter.period', period)
  },

  setDate ({ commit }, date) {
    commit('setDate', moment(date).valueOf())
  },

  setPeriodNext ({ state, commit, rootState, rootGetters }) {
    if (rootGetters.hasTrns) {
      const trns = rootState.trns.items
      const firstCreatedTrnIdFromSelectedTrns = rootGetters.firstCreatedTrnIdFromSelectedTrns
      const firstCreatedTrn = trns[firstCreatedTrnIdFromSelectedTrns]
      const firstCreatedTrnDate = moment(firstCreatedTrn.date).startOf(state.period).valueOf()
      const selectedMonth = state.date
      const nextDate = moment(selectedMonth).subtract(1, state.period).startOf(state.period).valueOf()
      if (nextDate >= firstCreatedTrnDate) commit('setPeriodNext', nextDate)
    }
  },

  setPeriodPrev ({ state, commit, rootGetters }) {
    if (rootGetters.hasTrns) {
      const selectedMonth = state.date
      const nextDate = moment(selectedMonth).add(1, state.period).startOf(state.period).valueOf()
      if (nextDate < moment().valueOf()) commit('setPeriodPrev', nextDate)
    }
  }
}
