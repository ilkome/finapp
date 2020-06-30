import actions from './actions'
import mutations from './mutations'

const state = () => ({
  activeTab: 'stat',
  defaultBgColor: '#455a64',
  height: 0,
  mobile: true,
  pc: false,
  catsChart: 'visible',
  lastUsedCatsInTrnForm: 'hidden',
  statGraphsVisibility: 'visible',
  statItems: 'visible',
  statLastTrnsVisibility: 'visible',
  statSummuryVisibility: 'visible',
  stat: {
    activeTab: 'stat',
    walletsVisibility: 'visible'
  },
  width: 0
})

export default {
  state,
  actions,
  mutations
}
