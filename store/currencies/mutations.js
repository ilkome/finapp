export default {
  setCurrencies (state, { base, date, rates }) {
    state.base = base
    state.date = date
    state.rates = rates
  },

  showBaseCurrenciesModal (state) {
    state.modal.show = true
  },

  hideBaseCurrenciesModal (state) {
    state.modal.show = false
  }
}
