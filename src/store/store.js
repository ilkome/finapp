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
  leftBar: {
    isShow: true
  },
  trnForm: {
    isShow: false,
    action: 'create',
    updateTrnId: false,
    wasUpdatedTrn: false,
    categoryId: null,
    isShowCategories: false
  },
  dates: {
    start: moment().subtract(10, 'days').startOf('day').valueOf(),
    end: moment().endOf('day').valueOf()
  },
  dashboard: {
    calendarPreset: null
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
  setCalendarPreset(state, preset) {
    state.dashboard.calendarPreset = preset
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
      state.leftBar.isShow = false
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
        state.leftBar.isShow = true
        break
      case 'hide':
        state.leftBar.isShow = false
        break
      default:
        state.leftBar.isShow = !state.leftBar.isShow
    }
    if (state.leftBar.isShow && state.isMobile) {
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
  setMobile(state) {
    state.isMobile = true
  },
  showError(state, error) {
    state.error = error
  },
  showLoader() {
    state.loader = true
  },
  closeLoader() {
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
  mutations
})
