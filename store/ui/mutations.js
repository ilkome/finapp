export default {
  // Active Tab in stat v2
  setActiveTabViewName (state, tabViewName) {
    state.activeTabViewName = tabViewName
  },

  setActiveTab (state, tabName) {
    state.activeTab = tabName
  },

  setActiveTabStat (state, tabName) {
    state.activeTabStat = tabName
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

  setVisibleCatsChartPie (state, status) {
    state.catsChartPie = status
  },

  setVisibilityStatItems (state, status) {
    state.statItems = status
  },

  setShow (state, { id, value }) {
    state.stat[id] = value
  }
}
