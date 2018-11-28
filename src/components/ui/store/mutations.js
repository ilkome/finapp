export default {
  setActiveTab (state, tabName) {
    state.prevTab = state.activeTab
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

  // stat chats
  showStatGraphs (state) {
    state.statGraphsVisible = true
  },
  hideStatGraphs (state) {
    state.statGraphsVisible = false
  },
  toogleStatGraphs (state) {
    state.statGraphsVisible = !state.statGraphsVisible
  },

  // toggle last used categories in trnForm
  setLastUsedCatsInTrnForm (state, status) {
    state.lastUsedCatsInTrnForm = status
  },

  // visible last trns in mobile stat
  setVisibleLastTrns (state, status) {
    state.lastTrns = status
  },

  // visible cats charts
  setVisibleCatsChart (state, status) {
    state.catsChart = status
  },
  setVisibilityStatItems (state, status) {
    state.statItems = status
  },
  setStatWalletsVisibility (state, status) {
    state.stat.walletsVisibility = status
  }
}
