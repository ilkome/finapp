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

  setShow (state, { id, value }) {
    state.stat[id] = value
  }
}
