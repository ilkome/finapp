import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const state = () => ({
  showedPeriods: 10,
  categoryModal: {
    id: null,
    show: false
  }
})

export default {
  state,
  actions,
  getters,
  mutations
}
