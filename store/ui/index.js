import actions from './actions'
import mutations from './mutations'

const state = () => ({
  activeTab: 'stat',
  activeTabStat: 'details',

  width: 0,
  height: 0,
  mobile: false,
  pc: false,

  defaultBgColor: '#455a64'
})

export default {
  state,
  actions,
  mutations
}
