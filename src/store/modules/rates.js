import { getRates } from '../../api/'

const store = {
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
        const rates = await getRates()
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

export default store
