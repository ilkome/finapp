import localforage from 'localforage'

export default {
  async initUi ({ commit, dispatch }) {
    const uiLocalStore = await localforage.getItem('uiLocalStore')

    // ui
    if (uiLocalStore) {
      // stat
      if (uiLocalStore.stat) {
        // stat tab
        uiLocalStore.stat.activeTab &&
          dispatch('setActiveTabStat', uiLocalStore.stat.activeTab)
      }
    }

    dispatch('setUiView')
  },

  /**
   * Change theme
   * Commit new theme and save to localStorage
   *
   * @param {string} theme - New theme value (light, dark).
   */
  changeTheme ({ commit, rootState }, theme) {
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
      localforage.setItem('finapp.activeTab', nextTab)
    }
  },

  /**
    * Set active tab at Stat screen on Mobile
    * Commit new tab and save ui state to localStorage
    *
    * @param {string} nextTab - Next tab name.
  */
  setActiveTabStat ({ commit, state }, nextTab) {
    if (state.stat.activeTab !== nextTab) {
      commit('setActiveTabStat', nextTab)
      localforage.setItem('uiLocalStore', state)
    }
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
  async saveUiView ({ commit, dispatch, state, rootState }) {
    const localName = 'finapp.statViewConfig'
    const localFilterUi = await localforage.getItem(localName)
    const walletName = rootState.filter.walletId || 'root'
    const categoryName = rootState.filter.categoryId || 'root'
    const uiItemName = `${walletName}${categoryName}`

    await localforage.setItem(localName, {
      ...localFilterUi,
      [uiItemName]: {
        catsChart: rootState.ui.catsChart,
        period: rootState.filter.period,
        statGraphsVisibility: rootState.ui.statGraphsVisibility,
        statItems: rootState.ui.statItems,
        totalChartPeriods: rootState.chart.periods
      }
    })
  },

  /**
    * Set ui view params for selected filter
  */
  async setUiView ({ commit, dispatch, state, rootState }) {
    const localName = 'finapp.statViewConfig'
    const localFilterUi = await localforage.getItem(localName)
    const walletName = rootState.filter.walletId || 'root'
    const categoryName = rootState.filter.categoryId || 'root'
    const uiItemName = `${walletName}${categoryName}`

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

      // cats items
      localFilterUiItem.statItems === 'visible'
        ? commit('setVisibilityStatItems', 'visible')
        : commit('setVisibilityStatItems', 'hidden')

      // periods in total chart
      const currentPeriodName = rootState.filter.period
      const localPeriodValues = localFilterUiItem.totalChartPeriods[currentPeriodName]
      commit('chart/setPeriodValues', {
        periodName: currentPeriodName,
        values: localPeriodValues
      }, { root: true })
    }
  }
}
