export default {
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
  }
}
