import { getRates } from '../../api/api'

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
        console.groupCollapsed('store/rates/@getRates')
        const rates = await getRates()
        commit('getRates', rates)
      } catch (error) {
        throw new Error(error.message)
      } finally {
        console.groupEnd()
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
