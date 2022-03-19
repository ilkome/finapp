export default {
  setCurrencies(state, { base, rates }) {
    state.base = base
    state.rates = rates
  },

  showBaseCurrenciesModal(state) {
    state.modal.show = true
  },

  hideBaseCurrenciesModal(state) {
    state.modal.show = false
  },
}
