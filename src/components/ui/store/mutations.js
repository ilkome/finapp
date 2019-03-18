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

  setTheme (state, theme) {
    state.theme = theme
  },

  showStatGraphs (state) {
    state.statGraphsVisibility = 'visible'
  },

  hideStatGraphs (state) {
    state.statGraphsVisibility = 'hidden'
  },

  setLastUsedCatsInTrnForm (state, status) {
    state.lastUsedCatsInTrnForm = status
  },

  setVisibleCatsChart (state, status) {
    state.catsChart = status
  },

  setVisibilityStatItems (state, status) {
    state.statItems = status
  },

  setStatWalletsVisibility (state, status) {
    state.stat.walletsVisibility = status
  },

  setStatSummuryVisibility (state, status) {
    state.statSummuryVisibility = status
  }
}
