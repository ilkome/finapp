import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const state = () => ({
  items: {},
  edit: {
    id: null
  },
  modal: {
    show: false,
    id: null
  }
})

export default {
  state,
  actions,
  getters,
  mutations
}
