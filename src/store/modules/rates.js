import { getRates } from '../../api/'

export default {
  state: {
    all: {}
  },

  getters: {
    rates(state) {
      return state.all
    }
  },

  actions: {
    async setRates({ commit }) {
      try {
        // const rates = await getRates()
        // console.log(JSON.stringify(rates))
        const rates = { 'AUD': 0.021736, 'BGN': 0.028502, 'BRL': 0.054004, 'CAD': 0.021191, 'CHF': 0.016619, 'CNY': 0.11415, 'CZK': 0.38003, 'DKK': 0.10842, 'GBP': 0.013229, 'HKD': 0.1366, 'HRK': 0.10825, 'HUF': 4.4635, 'IDR': 230.13, 'ILS': 0.061579, 'INR': 1.1174, 'JPY': 1.9001, 'KRW': 19.788, 'MXN': 0.30916, 'MYR': 0.073386, 'NOK': 0.13657, 'NZD': 0.024049, 'PHP': 0.88882, 'PLN': 0.061849, 'RON': 0.067018, 'SEK': 0.13947, 'SGD': 0.023505, 'THB': 0.57923, 'TRY': 0.059428, 'USD': 0.017483, 'ZAR': 0.22609, 'EUR': 0.014573 }
        commit('setRates', rates)
      } catch (error) {
        throw new Error(error.message)
      }
    }
  },

  mutations: {
    setRates(state, rates) {
      state.all = rates
    }
  }
}