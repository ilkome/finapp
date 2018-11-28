import moment from 'moment'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const state = {
  categoryId: null,
  walletId: null,
  date: moment().valueOf(),
  period: 'month',
  showFilterModal: false
}

export default {
  state,
  actions,
  getters,
  mutations
}
