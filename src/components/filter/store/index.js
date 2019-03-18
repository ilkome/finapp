import moment from 'moment'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const state = {
  categoryId: null,
  walletId: null,
  date: moment().valueOf(),
  period: 'week',
}

export default {
  state,
  actions,
  getters,
  mutations
}
