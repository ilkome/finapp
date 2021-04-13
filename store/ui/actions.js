import localforage from 'localforage'

export default {
  async initUi ({ commit, dispatch }) {
    const uiLocalStore = await localforage.getItem('finapp.stat')
    const activeTabViewName = await localforage.getItem('finapp.activeTabViewName')

    if (activeTabViewName) {
      commit('setActiveTabViewName', activeTabViewName)
    }

    // ui
    if (uiLocalStore) {
      // stat
      if (uiLocalStore.stat) {
        uiLocalStore.stat.activeTab &&
          dispatch('setActiveTab', uiLocalStore.stat.activeTab)

        uiLocalStore.stat.activeTabViewName &&
          dispatch('setActiveTabViewName', uiLocalStore.stat.activeTabViewName)

        uiLocalStore.stat.activeTabStat &&
          dispatch('setActiveTabStat', uiLocalStore.stat.activeTabStat)
      }
    }

    dispatch('setUiView')
  },

  setActiveTabViewName ({ state, commit, dispatch }, value) {
    if (state.activeTabViewName !== value) {
      commit('setActiveTabViewName', value)
      localforage.setItem('finapp.activeTabViewName', value)
      dispatch('ui/setUiView', null, { root: true })
    }
  },

  /**
   * Change theme
   * Commit new theme and save to localStorage
   *
   * @param {string} theme - New theme value (light, dark).
   */
  changeTheme (props, theme) {
    // eslint-disable-next-line no-undef
    const currentTheme = $nuxt.$colorMode.value
    let newTheme

    theme
      ? newTheme = theme
      : currentTheme === 'dark' ? newTheme = 'light' : newTheme = 'dark'

    // eslint-disable-next-line no-undef
    $nuxt.$colorMode.preference = newTheme
  },

  /**
    * Set app dimensions
    *
    * @param {number} height
    * @param {number} width
  */
  setAppDimensions ({ commit }, { height, width }) {
    let view = 'mobile'
    if (width >= 1000) { view = 'pc' }

    commit('setAppDimensions', {
      mobile: view === 'mobile',
      pc: view === 'pc',
      width,
      height
    })
  },

  /**
    * Set active tab
    * Commit new tab and save to localStorage
    *
    * @param {string} nextTab - Next tab name.
  */
  setActiveTab ({ commit, state }, nextTab) {
    if (state.activeTab !== nextTab) {
      commit('setActiveTab', nextTab)
      localforage.setItem('finapp.stat', state)
    }
  },

  /**
    * Set active tab at Stat screen on Mobile
    * Commit new tab and save ui state to localStorage
    *
    * @param {string} nextTab - Next tab name.
  */
  setActiveTabStat ({ commit, state }, nextTab) {
    commit('setActiveTabStat', nextTab)
    localforage.setItem('finapp.stat', state)
  },

  /**
    * Toogle all stat periods graph
  */
  toogleShowStatGraphs ({ state, commit, dispatch }) {
    state.statGraphsVisibility === 'visible'
      ? commit('hideStatGraphs')
      : commit('showStatGraphs')
    dispatch('ui/saveUiView', null, { root: true })
  },

  /**
    * Toggle cats chart
  */
  toogleVisibleCatsChart ({ commit, dispatch, state }) {
    let nextStatus
    state.catsChart === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    commit('setVisibleCatsChart', nextStatus)
    dispatch('ui/saveUiView', null, { root: true })
  },

  /**
    * Toggle cats chart pie
  */
  toogleVisibleCatsChartPie ({ commit, dispatch, state }) {
    let nextStatus
    state.catsChartPie === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    commit('setVisibleCatsChartPie', nextStatus)
    dispatch('ui/saveUiView', null, { root: true })
  },

  /**
    * Toggle stat cats items
  */
  toogleVisibilityStatItems ({ commit, dispatch, state }) {
    let nextStatus
    state.statItems === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    commit('setVisibilityStatItems', nextStatus)
    dispatch('ui/saveUiView', null, { root: true })
  },

  toogleStat ({ commit, dispatch, state }, id) {
    let value
    state.stat[id] === 'visible'
      ? value = 'hidden'
      : value = 'visible'

    commit('ui/setShow', { id, value }, { root: true })
    dispatch('ui/saveUiView', null, { root: true })
  },

  /**
    * Save ui view state to localStorage for selected filter
  */
  async saveUiView ({ rootState }) {
    const localName = 'finapp.statViewConfig'
    const localFilterUi = await localforage.getItem(localName)
    const walletName = rootState.filter.walletId || 'root'
    const periodName = rootState.filter.period || 'month'
    const categoryName = rootState.filter.categoryId || 'root'
    const activeTabViewName = rootState.ui.activeTabViewName || 'expenses'
    const uiItemName = `${walletName}${categoryName}${periodName}${activeTabViewName}`

    await localforage.setItem(localName, {
      ...localFilterUi,
      [uiItemName]: {
        catsChart: rootState.ui.catsChart,
        period: rootState.filter.period,
        statGraphsVisibility: rootState.ui.statGraphsVisibility,
        catsChartPie: rootState.ui.catsChartPie,
        statItems: rootState.ui.statItems,
        totalChartPeriods: rootState.chart.periods
      }
    })

    const periods = rootState.chart.periods
    localforage.setItem('finapp.chart.periods', periods)
  },

  /**
    * Set ui view params for selected filter
  */
  async setUiView ({ commit, rootState }) {
    const localName = 'finapp.statViewConfig'
    const localFilterUi = await localforage.getItem(localName)
    const walletName = rootState.filter.walletId || 'root'
    const periodName = rootState.filter.period || 'month'
    const categoryName = rootState.filter.categoryId || 'root'
    const activeTabViewName = rootState.ui.activeTabViewName || 'expenses'
    const uiItemName = `${walletName}${categoryName}${periodName}${activeTabViewName}`

    if (localFilterUi && localFilterUi[uiItemName]) {
      const localFilterUiItem = localFilterUi[uiItemName]

      // stat periods graph
      localFilterUiItem.statGraphsVisibility === 'visible'
        ? commit('showStatGraphs')
        : commit('hideStatGraphs')

      // cats chart
      localFilterUiItem.catsChart === 'visible'
        ? commit('setVisibleCatsChart', 'visible')
        : commit('setVisibleCatsChart', 'hidden')

      // cats chart pie
      localFilterUiItem.catsChartPie === 'visible'
        ? commit('setVisibleCatsChartPie', 'visible')
        : commit('setVisibleCatsChartPie', 'hidden')

      // cats items
      localFilterUiItem.statItems === 'visible'
        ? commit('setVisibilityStatItems', 'visible')
        : commit('setVisibilityStatItems', 'hidden')
    }
  }
}
