import actions from './actions'
import mutations from './mutations'

const state = {
  activeTab: 'stat',
  defaultBgColor: '#455a64',
  height: 0,
  mobile: true,
  pc: false,
  statGraphsVisibility: 'visible',
  lastUsedCatsInTrnForm: 'visible',
  catsChart: 'visible',
  statItems: 'visible',
  statSummuryVisibility: 'visible',
  stat: {
    activeTab: 'stat',
    walletsVisibility: 'visible'
  },
  theme: 'dark',
  width: 0
}

export default {
  state,
  actions,
  mutations
}
