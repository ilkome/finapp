import isEqual from 'lodash/isEqual'

export default {
  setCurrencies (state, { base, date, rates }) {
    if (!isEqual(state.base, base)) {
      state.base = base
    }
    if (!isEqual(state.date, date)) {
      state.date = date
    }
    if (!isEqual(state.rates, rates)) {
      state.rates = rates
    }
  },

  showBaseCurrenciesModal (state) {
    state.modal.show = true
  },

  hideBaseCurrenciesModal (state) {
    state.modal.show = false
  }
}
