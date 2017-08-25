import { getRates } from '../../api/rates'

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
    async getRates({ commit }) {
      try {
        const rates = await getRates()
        commit('getRates', rates)
      } catch (error) {
        throw new Error(error.message)
      }
    }
  },

  mutations: {
    getRates(state, rates) {
      state.all = rates
    }
  }
}

export default store
