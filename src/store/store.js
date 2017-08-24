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
  isPageLoaded: false,
  loader: true,
  error: false,
  filter: {
    duration: 10
  },
  leftBar: {
    isShow: true
  },
  trnForm: {
    isShow: false,
    action: 'create',
    isUpdateTrn: false,
    wasUpdatedTrn: false,
    categoryId: null,
    isShowCategories: false,
    showedChildIds: []
  },
  dates: {
    start: moment().subtract(10, 'days').startOf('day').valueOf(),
    end: moment().endOf('day').valueOf()
  },
  dashboard: {
    calendarPreset: null
  }
}

// actions dispatch
// ==============================================
const actions = {
}

// mutations commit
// ==============================================
const mutations = {
  setShowedChildIds(state, ids) {
    state.trnForm.showedChildIds = ids
  },

  pageLoaded(state) {
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

  closeTrnForm() {
    if (state.trnForm.isShow) {
      state.trnForm.isShow = false
      state.trnForm.isUpdateTrn = false
      state.trnForm.wasUpdatedTrn = false
      state.trnForm.isShowCategories = false
    }
  },

  toogleTrnForm() {
    state.trnForm.action = 'create'
    state.trnForm.isShow = !state.trnForm.isShow
    state.trnForm.isUpdateTrn = false
    state.trnForm.isShowCategories = false
    if (state.trnForm.isShow) {
      state.trnForm.wasUpdatedTrn = false
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

  setTrnForm(state, { action, trnId }) {
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

  setTrnFormCategoryId(state, categoryId) {
    state.trnForm.categoryId = categoryId
    state.trnForm.isShowCategories = false
  },

  toogleLeftbar() {
    state.leftBar.isShow = !state.leftBar.isShow
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
  actions,
  mutations
})
