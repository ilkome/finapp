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
  loader: false,
  pageLoading: true,
  filter: {
    duration: 10
  }
}

// actions dispatch
// ==============================================
const actions = {
}

// mutations commit
// ==============================================
const mutations = {
  pageLoaded() {
    state.pageLoading = false
  },

  showLoader() {
    state.loader = true
  },

  disableLoader() {
    state.loader = false
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
