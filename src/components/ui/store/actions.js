import localforage from 'localforage'

/**
  initUi
  changeTheme
  setAppDimensions

  setActiveTab
  setActiveTabStat

  toogleShowStatGraphs
  toogleLastUsedCatsInTrnForm
  toogleVisibilityStatItems
  toogleStatWalletsVisibility
  toogleStatWalletsVisibility

  saveUiView
  setUiView
*/
export default {
  async initUi ({ commit, dispatch }) {
    const uiLocalStore = await localforage.getItem('uiLocalStore')

    // visible trnForm last used categories
    const lastUsedCatsInTrnForm = await localforage.getItem('ui.lastUsedCatsInTrnForm')
    if (lastUsedCatsInTrnForm === 'visible') commit('setLastUsedCatsInTrnForm', 'visible')
    if (lastUsedCatsInTrnForm === 'hidden') commit('setLastUsedCatsInTrnForm', 'hidden')

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
    const body = document.querySelector('.body')
    let newTheme

    const changeToDark = () => {
      newTheme = 'dark'
      body.classList.add('theme-dark')
      body.classList.remove('theme-light')
    }

    const changeToLight = () => {
      newTheme = 'light'
      body.classList.add('theme-light')
      body.classList.remove('theme-dark')
    }

    theme
      ? theme === 'dark' ? changeToDark() : changeToLight()
      : rootState.ui.theme === 'dark' ? changeToLight() : changeToDark()

    commit('setTheme', newTheme)
    localforage.setItem('next.theme', newTheme)
  },

  /**
    * Set app dimensions
    *
    * @param {number} height
    * @param {number} width
  */
  setAppDimensions ({ commit }, { height, width }) {
    let view = 'mobile'
    if (width >= 1000) view = 'pc'

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
      localforage.setItem('next.activeTab', nextTab)
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
    dispatch('saveUiView')
  },

  /**
    * Toggle last used categories in trnForm on Mobile
  */
  toogleLastUsedCatsInTrnForm ({ commit, state }) {
    let nextStatus
    state.lastUsedCatsInTrnForm === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    localforage.setItem('ui.lastUsedCatsInTrnForm', nextStatus)
    commit('setLastUsedCatsInTrnForm', nextStatus)
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
    dispatch('saveUiView')
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
    dispatch('saveUiView')
  },

  /**
    * Toggle stat wallets
  */
  toogleStatWalletsVisibility ({ commit, dispatch, state }) {
    let nextStatus
    state.stat.walletsVisibility === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    commit('setStatWalletsVisibility', nextStatus)
    dispatch('saveUiView')
  },

  /**
    * Toggle stat summary
  */
  toogleStatSummuryVisibility ({ commit, dispatch, state }) {
    let nextStatus
    state.statSummuryVisibility === 'visible'
      ? nextStatus = 'hidden'
      : nextStatus = 'visible'

    commit('setStatSummuryVisibility', nextStatus)
    dispatch('saveUiView')
  },

  /**
    * Save ui view state to localStorage for selected filter
  */
  async saveUiView ({ commit, dispatch, state, rootState }) {
    const localName = 'finappUiView'
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
        statSummuryVisibility: rootState.ui.statSummuryVisibility,
        totalChartPeriods: rootState.chart.periods,
        walletsVisibility: rootState.ui.stat.walletsVisibility
      }
    })
  },

  /**
    * Set ui view params for selected filter
  */
  async setUiView ({ commit, dispatch, state, rootState }) {
    const localName = 'finappUiView'
    const localFilterUi = await localforage.getItem(localName)
    const walletName = rootState.filter.walletId || 'root'
    const categoryName = rootState.filter.categoryId || 'root'
    const uiItemName = `${walletName}${categoryName}`

    if (localFilterUi && localFilterUi[uiItemName]) {
      const localFilterUiItem = localFilterUi[uiItemName]

      // wallets visibility
      localFilterUiItem.walletsVisibility === 'visible'
        ? commit('setStatWalletsVisibility', 'visible')
        : commit('setStatWalletsVisibility', 'hidden')

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

      // stat summury
      localFilterUiItem.statSummuryVisibility === 'visible'
        ? commit('setStatSummuryVisibility', 'visible')
        : commit('setStatSummuryVisibility', 'hidden')

      // periods in total chart
      const currentPeriodName = rootState.filter.period
      const localPeriodValues = localFilterUiItem.totalChartPeriods[currentPeriodName]
      commit('setPeriodValues', { periodName: currentPeriodName, values: localPeriodValues })
    }
  }
}
