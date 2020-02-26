export default {
  hasProjects (state, getters, rootState) {
    if (rootState.projects.items) {
      if (Object.keys(rootState.projects.items).length > 0) return true
    }
    return false
  }
}
