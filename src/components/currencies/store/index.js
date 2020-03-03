import moment from 'moment'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const state = {
  base: 'RUB',
  date: moment().valueOf(),
  rates: {},
  modal: {
    show: false
  }
}

export default {
  state,
  actions,
  getters,
  mutations
}
