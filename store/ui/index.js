import actions from './actions'
import mutations from './mutations'

const state = () => ({
  activeTab: 'stat',
  defaultBgColor: '#455a64',
  height: 0,
  mobile: false,
  pc: false,
  catsChart: 'visible',
  catsChartPie: 'hidden',
  statGraphsVisibility: 'visible',
  statItems: 'visible',
  stat: {
    activeTab: 'stat'
  },
  activeTabStat: 'details',
  activeTabViewName: 'stat'
})

export default {
  state,
  actions,
  mutations
}
