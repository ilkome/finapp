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
  statLastTrnsVisibility: 'hidden',
  statSummuryVisibility: 'visible',
  stat: {
    activeTab: 'stat',
    walletsVisibility: 'hidden'
  },
  width: 0
})

export default {
  state,
  actions,
  mutations
}
