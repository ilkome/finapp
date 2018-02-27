import localforage from 'localforage'

export default {
  async setMobileDashboardActiveTab({ commit, state }, tabName) {
    if (state.mobileDashboardActiveTab === tabName) return

    const localViews = await localforage.getItem('views')
    if (localViews) {
      await localforage.setItem('views', {
        ...localViews,
        mobileDashboardActiveTab: tabName
      })
    } else {
      await localforage.setItem('views', {
        mobileDashboardActiveTab: tabName
      })
    }

    commit('setMobileDashboardActiveTab', tabName)

    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }
}
