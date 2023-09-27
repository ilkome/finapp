export default {
  setCurrencies(state, { base, rates }) {
    state.base = base
    state.rates = rates
  },

  setBaseRate(state, currencyCode) {
    state.base = currencyCode
  },

  showBaseCurrenciesModal(state) {
    state.modal.show = true
  },

  hideBaseCurrenciesModal(state) {
    state.modal.show = false
  },
}
