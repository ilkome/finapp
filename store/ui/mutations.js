export default {
  setActiveTab (state, tabName) {
    state.activeTab = tabName
  },
  setActiveTabStat (state, tabName) {
    state.stat.activeTab = tabName
  },

  setAppDimensions (state, props) {
    state.mobile = props.mobile
    state.pc = props.pc
    state.height = props.height
    state.width = props.width
  },

  showStatGraphs (state) {
    state.statGraphsVisibility = 'visible'
  },

  hideStatGraphs (state) {
    state.statGraphsVisibility = 'hidden'
  },

  setVisibleCatsChart (state, status) {
    state.catsChart = status
  },

  setVisibilityStatItems (state, status) {
    state.statItems = status
  },

  setShow (state, { id, value }) {
    state.stat[id] = value
  }
}
