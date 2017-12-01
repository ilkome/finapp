import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'

import accounts from './modules/accounts'
import categories from './modules/categories'
import rates from './modules/rates'
import trns from './modules/transactions'
import user from './modules/user'
import filter from './modules/filter'

Vue.use(Vuex)

// modules
// ==============================================
const modules = {
  accounts,
  categories,
  rates,
  trns,
  user,
  filter
}

// state
// ==============================================
const state = {
  isMobile: false,
  isPageLoaded: false,
  loader: true,
  error: false,
  showedLeftbar: false,
  trnForm: {
    isShow: false,
    action: 'create',
    updateTrnId: false,
    wasUpdatedTrn: false,
    categoryId: null,
    isShowCategories: false
  },
  dates: {},
  dashboard: {
    timePeriod: 'month'
  },
  isShowSidebarAccountsIcons: true,
  openedCategories: {
    incomes: [],
    expenses: []
  }
}

// mutations (commit)
// ==============================================
const mutations = {
  pageLoading() {
    state.isPageLoaded = false
  },
  pageLoaded() {
    state.isPageLoaded = true
  },
  setDates(state, dates) {
    state.dates.start = moment(dates.start).startOf('day').valueOf()
    state.dates.end = moment(dates.end).endOf('day').valueOf()
  },
  setTimePeriod(state, preset) {
    state.dashboard.timePeriod = preset
  },
  setUpdatedTrn(state, trnId) {
    state.trnForm.wasUpdatedTrn = trnId
  },
  closeTrnForm(state) {
    if (state.trnForm.isShow) {
      state.trnForm.isShow = false
      state.trnForm.wasUpdatedTrn = false
      state.trnForm.isShowCategories = false
    }
    state.trnForm.updateTrnId = false
  },
  toogleTrnForm(state, action) {
    switch (action) {
      case 'show':
        state.trnForm.isShow = true
        break
      case 'hide':
        state.trnForm.isShow = false
        break
      default:
        state.trnForm.isShow = !state.trnForm.isShow
    }

    state.trnForm.action = 'create'
    state.trnForm.updateTrnId = false
    state.trnForm.isShowCategories = false
    if (state.trnForm.isShow) {
      state.trnForm.wasUpdatedTrn = false
    }
    if (state.trnForm.isShow && state.isMobile) {
      state.showedLeftbar = false
    }
  },
  toogleCategoriesPop(state, action) {
    switch (action) {
      case 'show':
        state.trnForm.isShowCategories = true
        break
      case 'hide':
        state.trnForm.isShowCategories = false
        break
      default:
        state.trnForm.isShowCategories = !state.trnForm.isShowCategories
    }
  },
  toogleLeftbar(state, action) {
    switch (action) {
      case 'show':
        state.showedLeftbar = true
        break
      case 'hide':
        state.showedLeftbar = false
        break
      default:
        state.showedLeftbar = !state.showedLeftbar
    }
    if (state.showedLeftbar && state.isMobile) {
      state.trnForm.isShow = false
    }
  },
  setTrnForm(state, { action, trnId }) {
    if (action === 'create') {
      state.trnForm.action = 'create'
      state.trnForm.isShow = true
      state.trnForm.updateTrnId = false
      state.trnForm.wasUpdatedTrn = false
    }

    if (action === 'update') {
      state.trnForm.action = 'update'
      state.trnForm.isShow = true
      state.trnForm.updateTrnId = trnId
      state.trnForm.wasUpdatedTrn = false
    }
  },
  setTrnFormCategoryId(state, categoryId) {
    state.trnForm.categoryId = categoryId
    state.trnForm.isShowCategories = false
  },
  setMobile(state, action) {
    state.isMobile = action
  },
  showLoader() {
    state.loader = true
  },
  closeLoader() {
    state.loader = false
  }
}

// export
// ==============================================
export default new Vuex.Store({
  modules,
  state,
  mutations
})
