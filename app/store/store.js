import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'

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
    appStatus: '',
    filter: {
      date: moment()
    }
  },

  actions: {
    setNextPrevDate({ commit, state }, way) {
      let date
      if (way === 'prev') date = moment(state.filter.date).subtract(1, 'days')
      if (way === 'next') date = moment(state.filter.date).add(1, 'days')
      commit('setFilterDate', date)
    }
  },

  mutations: {
    loading(state) {
      state.loading = false
    },
    setappStatus(state, status) {
      state.appStatus = status
    },
    setFilterDate(state, date) {
      state.filter.date = date
    },
  }
})

export default store
