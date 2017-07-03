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
  error: false,
  pageLoading: true,
  filter: {
    duration: 10
  },
  trnForm: {
    isShow: false,
    action: 'create',
    isUpdateTrn: false,
    wasUpdatedTrn: false
  }
}

// actions dispatch
// ==============================================
const actions = {
}

// mutations commit
// ==============================================
const mutations = {
  setUpdatedTrn(state, trnId) {
    state.trnForm.wasUpdatedTrn = trnId
  },

  toogleTrnForm() {
    state.trnForm.action = 'create'
    state.trnForm.isShow = !state.trnForm.isShow
    state.trnForm.isUpdateTrn = false
    if (state.trnForm.isShow) state.trnForm.wasUpdatedTrn = false
  },

  settrnForm(state, { action, trnId }) {
    if (action === 'create') {
      state.trnForm.action = 'create'
      state.trnForm.isShow = true
      state.trnForm.isUpdateTrn = false
      state.trnForm.wasUpdatedTrn = false
    }

    if (action === 'update') {
      state.trnForm.action = 'update'
      state.trnForm.isShow = true
      state.trnForm.isUpdateTrn = trnId
      state.trnForm.wasUpdatedTrn = false
    }
  },

  pageLoaded() {
    state.pageLoading = false
  },

  showError(state, error) {
    state.error = error
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
