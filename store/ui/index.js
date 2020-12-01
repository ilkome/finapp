import actions from './actions'
import mutations from './mutations'

const state = () => ({
  activeTab: 'stat',
  defaultBgColor: '#455a64',
  height: 0,
  mobile: false,
  pc: false,
  catsChart: 'visible',
  statGraphsVisibility: 'visible',
  statItems: 'visible',
  stat: {
    activeTab: 'incomes',
    averageStatVisibility: 'visible'
  },

  // Active tab for stat v2
  activeTabViewName: 'incomes'
})

export default {
  state,
  actions,
  mutations
}
