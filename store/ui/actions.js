import localforage from 'localforage'

export default {
  async initUi({ dispatch }) {
    const uiLocalStore = await localforage.getItem('finapp.stat')

    // ui
    if (uiLocalStore) {
      if (uiLocalStore.activeTab)
        dispatch('setActiveTab', uiLocalStore.activeTab)
    }
  },

  /**
   * Change theme
   * Commit new theme and save to localStorage
   *
   * @param {string} theme - New theme value (light, dark).
   */
  changeTheme(_, theme) {
    // eslint-disable-next-line no-undef
    const currentTheme = $nuxt.$colorMode.value
    let newTheme

    theme
      ? newTheme = theme
      : currentTheme === 'dark'
        ? newTheme = 'light'
        : newTheme = 'dark'

    // eslint-disable-next-line no-undef
    $nuxt.$colorMode.preference = newTheme
  },

  setTheme(_, theme) {
    // eslint-disable-next-line no-undef
    $nuxt.$colorMode.preference = theme
  },

  /**
    * Set app dimensions
    *
    * @param {number} height
    * @param {number} width
  */
  setAppDimensions({ commit }, { height, width }) {
    let view = 'mobile'
    if (width >= 1024)
      view = 'pc'

    commit('setAppDimensions', {
      mobile: view === 'mobile',
      pc: view === 'pc',
      width,
      height,
    })
  },

  /**
    * Set active tab
    * Commit new tab and save to localStorage
    *
    * @param {string} nextTab - Next tab name.
  */
  setActiveTab({ commit, state }, nextTab) {
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
  setActiveTabStat({ commit, state }, nextTab) {
    commit('setActiveTabStat', nextTab)
    localforage.setItem('finapp.stat', state)
  },

  /**
    * Save ui view state to localStorage for selected filter
  */
  async saveUiView({ rootState }) {
    const localName = 'finapp.statViewConfig'
    const localFilterUi = await localforage.getItem(localName)
    const walletName = rootState.filter.walletId || 'root'
    const periodName = rootState.filter.period || 'month'
    const categoryName = rootState.filter.categoryId || 'root'
    const uiItemName = `${walletName}${categoryName}${periodName}`

    await localforage.setItem(localName, {
      ...localFilterUi,
      [uiItemName]: {
        period: rootState.filter.period,
        totalChartPeriods: rootState.chart.periods,
      },
    })

    const periods = rootState.chart.periods
    await localforage.setItem('finapp.chart.periods', periods)
  },
}
