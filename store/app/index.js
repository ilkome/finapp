import actions from './actions'
import mutations from './mutations'

export const initStatus = {
  loading: true,
  login: false,
  ready: false
}

const state = () => ({
  status: {
    ...initStatus,
    loading: true
  }
})

export default {
  state,
  actions,
  mutations
}
