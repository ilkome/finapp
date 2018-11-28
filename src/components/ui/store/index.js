import actions from './actions'
import mutations from './mutations'

const state = {
  activeTab: 'stat',
  defaultBgColor: '#455a64',
  height: 0,
  mobile: true,
  pc: false,
  prevTab: null,
  statGraphsVisible: true,
  lastUsedCatsInTrnForm: 'hidden',
  lastTrns: 'visible',
  catsChart: 'visible',
  statItems: 'visible',
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
