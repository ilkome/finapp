import actions from './actions'
import mutations from './mutations'

export const initStatus = {
  loading: false,
  login: false,
  ready: false
}

const state = {
  theme: '',
  status: {
    ...initStatus,
    loading: true
  }
}

export default {
  state,
  actions,
  mutations
}
