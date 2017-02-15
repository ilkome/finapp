import Vue from 'vue'
import Vuex from 'vuex'

import accounts from './modules/accounts'
import categories from './modules/categories'
import rates from './modules/rates'
import trns from './modules/transactions'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    accounts,
    categories,
    rates,
    trns
  },

  state: {
    loading: true,
    globalStatus: ''
  },

  mutations: {
    loading(state) {
      state.loading = false
    },
    setGlobalStatus(state, status) {
      state.globalStatus = status
    }
  }
})

export default store
