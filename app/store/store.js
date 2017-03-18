import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'

import accounts from './modules/accounts'
import categories from './modules/categories'
import rates from './modules/rates'
import trns from './modules/transactions'

Vue.use(Vuex)

// modules
// ==============================================
const modules = {
  accounts,
  categories,
  rates,
  trns
}

// state
// ==============================================
const state = {
  loading: true,
  appStatus: '',
  filter: {
    date: moment()
  }
}

// actions dispatch
// ==============================================
const actions = {
  setNextPrevDate({ commit, state }, way) {
    let date
    if (way === 'prev') date = moment(state.filter.date).subtract(1, 'days')
    if (way === 'next') date = moment(state.filter.date).add(1, 'days')
    commit('setFilterDate', date)
  },
  setAppStatus({ commit }, status, timeout = true) {
    commit('setAppStatus', status)
    if (timeout) setTimeout(() => commit('setAppStatus', ''), 3000)
  }
}

// mutations commit
// ==============================================
const mutations = {
  loading(state) {
    state.loading = false
  },
  setAppStatus(state, status) {
    state.appStatus = status
  },
  setFilterDate(state, date) {
    state.filter.date = date
  },
}

// export
// ==============================================
export default new Vuex.Store({
  modules,
  state,
  actions,
  mutations
})
