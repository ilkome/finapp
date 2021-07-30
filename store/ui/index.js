import actions from './actions'
import mutations from './mutations'

const state = () => ({
  activeTab: 'stat',
  defaultBgColor: '#455a64',

  width: 0,
  height: 0,
  mobile: false,
  pc: false,

  activeTabStat: 'details',
  activeTabViewName: 'stat'
})

export default {
  state,
  actions,
  mutations
}
