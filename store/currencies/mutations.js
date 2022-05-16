export default {
  setCurrencies(state, { base, rates }) {
    state.base = base
    state.rates = rates
  },

  setBaseRate(state, rate) {
    state.base = rate
  },

  showBaseCurrenciesModal(state) {
    state.modal.show = true
  },

  hideBaseCurrenciesModal(state) {
    state.modal.show = false
  },
}
