import { getRates } from '../../api/api'

const store = {
  state: {
    all: []
  },

  getters: {
    rates(state) {
      return state.all
    }
  },

  actions: {
    async fetchRates({ commit }) {
      const data = await getRates()
      commit('fetchRates', data)
    }
  },

  mutations: {
    fetchRates(state, data) {
      state.all = data
    }
  }
}

export default store
