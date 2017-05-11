import Vue from 'vue'
import Vuex from 'vuex'

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
    duration: 10
  }
}

// actions dispatch
// ==============================================
const actions = {
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
    console.log(state.appStatus)
  },

  setDuration(state, duration) {
    state.filter.duration = +duration
  }
}

// export
// ==============================================
export default new Vuex.Store({
  modules,
  state,
  actions,
  mutations
})
